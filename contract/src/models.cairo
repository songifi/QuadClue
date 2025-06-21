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
