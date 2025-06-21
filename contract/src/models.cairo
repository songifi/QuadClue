use starknet::{ContractAddress, get_block_timestamp};
use origami_random::deck::{Deck, DeckTrait};
use quad_clue::constant::{MAX_AVAILABLE_LETTERS};
use core::pedersen::{pedersen};
use quad_clue::utils::{contains_letter, shuffle_letters, count_non_answer_letters};

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Puzzle {
    #[key]
    pub id: u64,
    pub image_hashes: Span<felt252>, // 4 IPFS hashes for images
    pub answer_hash: felt252, // hash of correct answer
    pub word_length: u8, // Number of letters in answer
    pub available_letters: Span<felt252>, // Packed scrambled letters pool
    pub active: bool,
    pub difficulty: felt252, // level 1-5 scale // TODO: incorporate difficulty
    pub creation_time: u64,
    pub solve_count: u32, // Number of players who solved it
    pub first_solver: ContractAddress,
}

#[derive(Clone, Drop, Serde, Debug, PartialEq)]
pub struct PuzzleData {
    pub image_hashes: Span<felt252>,
    pub answer: ByteArray,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct GameState {
    #[key]
    pub id: felt252, // represents GAME_ID
    pub puzzle_count: u64,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug)]
pub enum Difficulty {
    LEVEL_1,
    LEVEL_2,
    LEVEL_3,
    LEVEL_4,
    LEVEL_5,
}

impl DifficultyIntoFelt252 of Into<Difficulty, felt252> {
    fn into(self: Difficulty) -> felt252 {
        match self {
            Difficulty::LEVEL_1 => 'LEVEL_1',
            Difficulty::LEVEL_2 => 'LEVEL_2',
            Difficulty::LEVEL_3 => 'LEVEL_3',
            Difficulty::LEVEL_4 => 'LEVEL_4',
            Difficulty::LEVEL_5 => 'LEVEL_5',
        }
    }
}

impl Felt252TryIntoDifficulty of TryInto<felt252, Difficulty> {
    fn try_into(self: felt252) -> Option<Difficulty> {
        if self == 'LEVEL_1' {
            Option::Some(Difficulty::LEVEL_1)
        } else if self == 'LEVEL_2' {
            Option::Some(Difficulty::LEVEL_2)
        } else if self == 'LEVEL_3' {
            Option::Some(Difficulty::LEVEL_3)
        } else if self == 'LEVEL_4' {
            Option::Some(Difficulty::LEVEL_4)
        } else if self == 'LEVEL_5' {
            Option::Some(Difficulty::LEVEL_5)
        } else {
            Option::None
        }
    }
}


#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct PlayerStats {
    #[key]
    pub player: ContractAddress,
    pub puzzles_solved: u32,
    pub total_attempts: u32,
    pub tokens_earned: u256,
    pub current_streak: u32, // TODO: add streak system & hints system
    pub hints_used: u32,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct GuessAttempt {
    #[key]
    pub puzzle_id: u256,
    #[key]
    pub player: ContractAddress,
    pub attempt_count: u32,
    // pub selected_letters: Array<felt252>,
// pub timestamp: u64,
}

#[generate_trait]
pub impl PuzzleImpl of PuzzleTrait {
    fn hash_word(word: ByteArray) -> felt252 {
        let mut hash_accumulator = 0;
        let word_len = word.len();

        let mut i = 0;
        while i < word_len {
            hash_accumulator = pedersen(hash_accumulator, word[i].into());
            i += 1;
        };

        hash_accumulator
    }

    fn split_word(word: ByteArray) -> Span<felt252> {
        let word_len = word.len();
        let mut letters = array![];

        let mut i = 0;
        while i < word_len {
            letters.append(word[i].into());
            i += 1;
        };

        letters.span()
    }

    fn validate_guess_letters(guess: ByteArray, available_letters: Span<felt252>) -> bool {
        let guess_letters = Self::split_word(guess.clone());

        // Check each guessed letter exists in available pool
        let mut i = 0;
        loop {
            if i >= guess_letters.len() {
                break true;
            }

            let letter = *guess_letters.at(i);
            let mut found = false;
            let mut j = 0;

            // Search for letter in available pool
            loop {
                if j >= available_letters.len() {
                    break;
                }
                if *available_letters.at(j) == letter {
                    found = true;
                    break;
                }
                j += 1;
            };

            if !found {
                break false; // Letter not found in available pool
            }
            i += 1;
        }
    }


    // Generate letter pool automatically from answer
    fn generate_available_letters(answer: ByteArray) -> Span<felt252> {
        let answer_letters = Self::split_word(answer.clone());
        let mut available_letters = ArrayTrait::new();

        // Add all answer letters first
        let mut i = 0;
        loop {
            if i >= answer_letters.len() {
                break;
            }
            available_letters.append(*answer_letters.at(i));
            i += 1;
        };

        // Define common distractor letters
        let distractors = array![
            'A',
            'E',
            'I',
            'O',
            'U',
            'R',
            'S',
            'T',
            'L',
            'N',
            'D',
            'G',
            'H',
            'M',
            'P',
            'C',
            'F',
            'W',
            'Y',
            'B',
        ]
            .span();

        let answer_hash = Self::hash_word(answer.clone());
        let seed = answer_hash
            + get_block_timestamp().into(); // Combine timestamp + answer for seed
        let mut deck = DeckTrait::new(seed, distractors.len().try_into().unwrap());

        let mut attempts = 0;
        loop {
            if available_letters.len() >= MAX_AVAILABLE_LETTERS.into()
                || attempts >= distractors.len()
                * 2 {
                break;
            }

            let random_index = deck.draw();
            let distractor = *distractors.at((random_index - 1).into());

            // Only add if not already in available letters
            if !contains_letter(available_letters.span(), distractor) {
                available_letters.append(distractor);
            }

            attempts += 1;
        };

        shuffle_letters(available_letters)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_word() {
        let word1: ByteArray = "hello";
        let word2: ByteArray = "world";

        let hash1 = PuzzleTrait::hash_word(word1.clone());
        let hash2 = PuzzleTrait::hash_word(word2.clone());

        assert!(hash1 != hash2, "Different words");
        assert!(hash1 == PuzzleTrait::hash_word(word1), "Same word");
    }

    #[test]
    fn test_split_word() {
        let word: ByteArray = "hello";
        let letters = PuzzleTrait::split_word(word.clone());

        assert!(letters.len() == 5, "Should have 5 letters");
        assert!(*letters[0] == 'h', "First letter should be 'h'");
        assert!(*letters[1] == 'e', "Second letter should be 'e'");
        assert!(*letters[2] == 'l', "Third letter should be 'l'");
        assert!(*letters[3] == 'l', "Fourth letter should be 'l'");
        assert!(*letters[4] == 'o', "Fifth letter should be 'o'");
    }

    #[test]
    fn test_validate_guess_letters() {
        let available_letters: Span<felt252> = array!['h', 'e', 'l', 'l', 'o'].span();
        let guess1: ByteArray = "hello";
        let guess2: ByteArray = "world";

        assert(
            PuzzleTrait::validate_guess_letters(guess1, available_letters), 'Guess should be valid',
        );
        assert!(
            !PuzzleTrait::validate_guess_letters(guess2, available_letters),
            "Guess should be invalid",
        );

        let guess1: ByteArray = "complex";
        let guess2: ByteArray = "satisfy";

        assert(
            PuzzleTrait::validate_guess_letters(guess1.clone(), PuzzleTrait::split_word(guess1)),
            'Guess should be valid',
        );
        assert!(
            PuzzleTrait::validate_guess_letters(guess2.clone(), PuzzleTrait::split_word(guess2)),
            "Guess2 should be valid",
        );

        let guess1: ByteArray = "helloq";
        let guess2: ByteArray = "worldz";

        let available_letters: Span<felt252> = array![
            'h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd',
        ]
            .span();

        assert(
            !PuzzleTrait::validate_guess_letters(guess1, available_letters),
            'Guess should be invalid',
        );
        assert!(
            !PuzzleTrait::validate_guess_letters(guess2, available_letters),
            "Guess2 should be invalid",
        );
    }

    #[test]
    fn test_generate_available_letters_basic() {
        let answer = "CAT";
        let available = PuzzleTrait::generate_available_letters(answer);

        // Should have exactly 12 letters
        assert_eq!(available.len(), MAX_AVAILABLE_LETTERS.into());

        // Should contain all answer letters
        assert!(contains_letter(available, 'C'));
        assert!(contains_letter(available, 'A'));
        assert!(contains_letter(available, 'T'));
    }

    #[test]
    fn test_generate_available_letters_duplicates_in_answer() {
        let answer = "BOOK"; // Has duplicate 'O'
        let available = PuzzleTrait::generate_available_letters(answer);

        assert_eq!(available.len(), MAX_AVAILABLE_LETTERS.into());

        // Should contain all unique answer letters
        assert!(contains_letter(available, 'B'));
        assert!(contains_letter(available, 'O'));
        assert!(contains_letter(available, 'K'));

        // Count occurrences of 'O' - should appear twice since answer has two
        let mut o_count = 0;
        let mut i = 0;
        loop {
            if i >= available.len() {
                break;
            }
            if *available.at(i) == 'O' {
                o_count += 1;
            }
            i += 1;
        };
        assert_eq!(o_count, 2); // Two 'O's from "BOOK"
    }

    #[test]
    fn test_generate_available_letters_short_answer() {
        let answer = "GO";
        let available = PuzzleTrait::generate_available_letters(answer);

        assert_eq!(available.len(), MAX_AVAILABLE_LETTERS.into());
        assert!(contains_letter(available, 'G'));
        assert!(contains_letter(available, 'O'));

        // Should have 10 distractor letters (12 - 2 from answer)
        let non_answer_count = count_non_answer_letters(available, "GO");
        assert_eq!(non_answer_count, 10);
    }

    #[test]
    fn test_generate_available_letters_long_answer() {
        let answer = "ELEPHANT"; // 8 letters
        let available = PuzzleTrait::generate_available_letters(answer);

        assert_eq!(available.len(), MAX_AVAILABLE_LETTERS.into());

        // Should contain all unique answer letters
        assert!(contains_letter(available, 'E'));
        assert!(contains_letter(available, 'L'));
        assert!(contains_letter(available, 'P'));
        assert!(contains_letter(available, 'H'));
        assert!(contains_letter(available, 'A'));
        assert!(contains_letter(available, 'N'));
        assert!(contains_letter(available, 'T'));

        // Should have some distractors (depending on duplicates in answer)
        let non_answer_count = count_non_answer_letters(available, "ELEPHANT");
        assert!(non_answer_count >= 4); // At least some distractors
    }

    #[test]
    fn test_generate_available_letters_max_length_answer() {
        let answer: ByteArray = "ABCDEFGHIJKL"; // 12 letters (max)
        let available = PuzzleTrait::generate_available_letters(answer.clone());

        assert_eq!(available.len(), MAX_AVAILABLE_LETTERS.into());

        for i in 0..answer.len() {
            let letter = answer.at(i).unwrap();
            assert!(contains_letter(available, letter.into()));
        }
    }
}
