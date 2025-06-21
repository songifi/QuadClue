use quad_clue::models::{PuzzleTrait};
use origami_random::deck::{Deck, DeckTrait};
use starknet::{get_block_timestamp};

pub fn contains_letter(letters: Span<felt252>, target: felt252) -> bool {
    let mut i = 0;
    loop {
        if i >= letters.len() {
            break false;
        }
        if *letters.at(i) == target {
            break true;
        }
        i += 1;
    }
}

pub fn shuffle_letters(letters: Array<felt252>) -> Span<felt252> {
    let mut shuffled_letters = array![];
    let count = letters.len();

    let mut deck = DeckTrait::new(get_block_timestamp().into(), count.try_into().unwrap());

    for _ in 0..count {
        let i = deck.draw();
        shuffled_letters.append(*letters.at(i.into() - 1));
    };

    shuffled_letters.span()
}

pub fn count_non_answer_letters(available: Span<felt252>, answer: ByteArray) -> u32 {
    let answer_letters = PuzzleTrait::split_word(answer);
    let mut count = 0;

    for i in 0..available.len() {
        let letter = *available.at(i);
        if !contains_letter(answer_letters, letter) {
            count += 1;
        }
    };
    count
}

#[cfg(test)]
mod tests {
    use super::*;
    use quad_clue::models::{PuzzleTrait};

    #[test]
    fn test_contains_letter_found() {
        let letters = array!['a', 'b', 'c', 'd'].span();
        let target = 'b';

        let result = contains_letter(letters, target);

        assert!(result, "Should find letter 'b' in the array");
    }

    #[test]
    fn test_contains_letter_not_found() {
        let letters = array!['a', 'b', 'c', 'd'].span();
        let target = 'z';

        let result = contains_letter(letters, target);

        assert!(!result, "Should not find letter 'z' in the array");
    }

    #[test]
    fn test_contains_letter_empty_array() {
        let letters = array![].span();
        let target = 'a';

        let result = contains_letter(letters, target);

        assert!(!result, "Should return false for empty array");
    }

    #[test]
    fn test_contains_letter_first_element() {
        let letters = array!['x', 'y', 'z'].span();
        let target = 'x';

        let result = contains_letter(letters, target);

        assert!(result, "Should find first element");
    }

    #[test]
    fn test_contains_letter_last_element() {
        let letters = array!['x', 'y', 'z'].span();
        let target = 'z';

        let result = contains_letter(letters, target);

        assert!(result, "Should find last element");
    }

    #[test]
    fn test_contains_letter_duplicate_elements() {
        let letters = array!['a', 'b', 'a', 'c'].span();
        let target = 'a';

        let result = contains_letter(letters, target);

        assert!(result, "Should find duplicate letter");
    }

    #[test]
    fn test_shuffle_letters_preserves_all_elements() {
        let original = array!['a', 'b', 'c', 'd', 'e'];
        let original_span = original.span();

        let shuffled = shuffle_letters(original);

        // Check that all original letters are present in shuffled result
        assert_eq!(shuffled.len(), original_span.len(), "Shuffled array should have same length");

        for i in 0..original_span.len() {
            let letter = *original_span.at(i);
            assert!(contains_letter(shuffled, letter), "All original letters should be present");
        };
    }

    #[test]
    fn test_shuffle_letters_empty_array() {
        let original = array![];

        let shuffled = shuffle_letters(original);

        assert_eq!(shuffled.len(), 0, "Shuffled empty array should be empty");
    }

    #[test]
    fn test_shuffle_letters_single_element() {
        let original = array!['x'];

        let shuffled = shuffle_letters(original);

        assert_eq!(shuffled.len(), 1, "Single element array should remain length 1");
        assert_eq!(*shuffled.at(0), 'x', "Single element should be preserved");
    }

    #[test]
    fn test_shuffle_letters_duplicate_elements() {
        let original = array!['a', 'a', 'b', 'b'];
        let original_span = original.span();

        let shuffled = shuffle_letters(original);

        // Count occurrences of each letter
        let mut count_a_original = 0;
        let mut count_b_original = 0;
        let mut count_a_shuffled = 0;
        let mut count_b_shuffled = 0;

        for i in 0..original_span.len() {
            if *original_span.at(i) == 'a' {
                count_a_original += 1;
            }
            if *original_span.at(i) == 'b' {
                count_b_original += 1;
            }
        };

        for i in 0..shuffled.len() {
            if *shuffled.at(i) == 'a' {
                count_a_shuffled += 1;
            }
            if *shuffled.at(i) == 'b' {
                count_b_shuffled += 1;
            }
        };

        assert_eq!(count_a_original, count_a_shuffled, "Count of 'a' should be preserved");
        assert_eq!(count_b_original, count_b_shuffled, "Count of 'b' should be preserved");
    }

    #[test]
    fn test_count_non_answer_letters_no_overlap() {
        let available = array!['x', 'y', 'z'].span();
        let answer = "abc";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 3, "All letters should be non-answer letters");
    }

    #[test]
    fn test_count_non_answer_letters_complete_overlap() {
        let available = array!['a', 'b', 'c'].span();
        let answer = "abc";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 0, "No letters should be non-answer letters");
    }

    #[test]
    fn test_count_non_answer_letters_partial_overlap() {
        let available = array!['a', 'b', 'x', 'y'].span();
        let answer = "ab";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 2, "Two letters (x, y) should be non-answer letters");
    }

    #[test]
    fn test_count_non_answer_letters_empty_available() {
        let available = array![].span();
        let answer = "test";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 0, "Empty available array should return 0");
    }

    #[test]
    fn test_count_non_answer_letters_empty_answer() {
        let available = array!['a', 'b', 'c'].span();
        let answer = "";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 3, "All letters should be non-answer with empty answer");
    }

    #[test]
    fn test_count_non_answer_letters_duplicate_available() {
        let available = array!['a', 'a', 'b', 'x'].span();
        let answer = "a";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 2, "Should count duplicates of non-answer letters");
    }

    #[test]
    fn test_count_non_answer_letters_case_sensitivity() {
        // Assuming letters are case-sensitive
        let available = array!['A', 'a', 'b'].span();
        let answer = "a";

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 2, "Should treat 'A' and 'a' as different letters");
    }

    #[test]
    fn test_count_non_answer_letters_repeated_answer_letters() {
        let available = array!['a', 'b', 'b', 'c', 'x'].span();
        let answer = "abb"; // Answer contains repeated 'b'

        let count = count_non_answer_letters(available, answer);

        assert_eq!(count, 2, "Should count 'c' and 'x' as non-answer letters");
    }

    // Integration test combining multiple functions
    #[test]
    fn test_integration_shuffle_and_count() {
        let original = array!['a', 'b', 'c', 'x', 'y', 'z'];
        let answer = "abc";

        let shuffled = shuffle_letters(original);
        let count = count_non_answer_letters(shuffled, answer);

        assert_eq!(count, 3, "Should count 3 non-answer letters regardless of shuffle");
    }
}
