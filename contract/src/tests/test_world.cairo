#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage, ModelStorageTest};
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };

    use quad_clue::systems::actions::{actions, IActionsDispatcher, IActionsDispatcherTrait};
    use quad_clue::models::{
        Puzzle, m_Puzzle, GameState, m_GameState, PlayerStats, m_PlayerStats, GuessAttempt,
        m_GuessAttempt, Difficulty, PuzzleTrait, PuzzleData,
    };
    use quad_clue::constant::{GAME_ID};


    use starknet::{contract_address_const, testing};

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "quad_clue",
            resources: [
                TestResource::Model(m_Puzzle::TEST_CLASS_HASH),
                TestResource::Model(m_GameState::TEST_CLASS_HASH),
                TestResource::Model(m_PlayerStats::TEST_CLASS_HASH),
                TestResource::Event(actions::e_PuzzleCreated::TEST_CLASS_HASH),
                TestResource::Event(actions::e_PuzzleSolved::TEST_CLASS_HASH),
                TestResource::Event(actions::e_GuessSubmitted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_PlayerStatsUpdated::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
            ]
                .span(),
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"quad_clue", @"actions")
                .with_writer_of([dojo::utils::bytearray_hash(@"quad_clue")].span())
        ]
            .span()
    }

    pub fn setup() -> (WorldStorage, IActionsDispatcher) {
        let ndef = namespace_def();
        let mut world: WorldStorage = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        (world, actions_system)
    }

    #[test]
    #[should_panic(expected: ('Need exactly 4 images', 'ENTRYPOINT_FAILED'))]
    fn test_create_puzzle_image_hashes_not_4() {
        let (world, actions_system) = setup();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3'].span();
        let answer: ByteArray = "answer";

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        // Verify the puzzle was created
        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.id == puzzle_id, 'wrong puzzle ID');
        assert(puzzle.image_hashes.len() == 4, 'wrong number of image hashes');
        assert(puzzle.image_hashes == image_hashes, 'image hashes do not match');
        assert(
            puzzle.answer_hash == PuzzleTrait::hash_word(answer.clone()),
            'answer hash does not match',
        );
        assert(puzzle.word_length == answer.len().try_into().unwrap(), 'wrong word length');
        assert(puzzle.active, 'puzzle should be active');
        assert(puzzle.difficulty == Difficulty::LEVEL_1.into(), 'wrong difficulty level');
        assert(puzzle.solve_count == 0, 'solve count should be zero');
        assert(puzzle.first_solver == contract_address_const::<0>(), 'first solver should be zero');
    }

    #[test]
    #[should_panic(expected: ('Answer cannot be empty', 'ENTRYPOINT_FAILED'))]
    fn test_create_puzzle_empty_answer() {
        let (world, actions_system) = setup();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "";

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        // Verify the puzzle was created
        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.id == puzzle_id, 'wrong puzzle ID');
        assert(puzzle.image_hashes.len() == 4, 'wrong number of image hashes');
        assert(puzzle.image_hashes == image_hashes, 'image hashes do not match');
        assert(
            puzzle.answer_hash == PuzzleTrait::hash_word(answer.clone()),
            'answer hash does not match',
        );
        assert(puzzle.word_length == answer.len().try_into().unwrap(), 'wrong word length');
        assert(puzzle.active, 'puzzle should be active');
        assert(puzzle.difficulty == Difficulty::LEVEL_1.into(), 'wrong difficulty level');
        assert(puzzle.solve_count == 0, 'solve count should be zero');
        assert(puzzle.first_solver == contract_address_const::<0>(), 'first solver should be zero');
    }

    #[test]
    fn test_create_puzzle_ok() {
        let (world, actions_system) = setup();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "answer";
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        // Verify the puzzle was created
        let puzzle = actions_system.get_puzzle(puzzle_id);

        assert(puzzle.id == puzzle_id, 'wrong puzzle ID');
        assert(puzzle.image_hashes.len() == 4, 'wrong number of image hashes');
        assert(puzzle.image_hashes == image_hashes, 'image hashes do not match');
        assert(
            puzzle.answer_hash == PuzzleTrait::hash_word(answer.clone()),
            'answer hash does not match',
        );
        assert(puzzle.word_length == answer.len().try_into().unwrap(), 'wrong word length');
        assert(puzzle.active, 'puzzle should be active');
        assert(puzzle.difficulty == difficulty.into(), 'wrong difficulty level');
        assert(puzzle.solve_count == 0, 'solve count should be zero');
        assert(puzzle.first_solver == contract_address_const::<0>(), 'first solver should be zero');
    }

    #[test]
    fn test_get_player_stats() {
        let (world, actions_system) = setup();

        let player = contract_address_const::<'player'>();

        let player_stat = actions_system.get_player_stats(player);

        assert(player_stat.player == player, 'Player ID does not match');
        assert(player_stat.puzzles_solved == 0, 'puzzles_solved should be zero');
        assert(player_stat.total_attempts == 0, 'total_attempts should be zero');
        assert(player_stat.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stat.current_streak == 0, 'current_streak should be zero');
        assert(player_stat.hints_used == 0, 'hints_used should be zero');
    }

    #[test]
    #[should_panic(expected: ('Puzzle is not active', 'ENTRYPOINT_FAILED'))]
    fn test_submit_guess_puzzle_not_active() {
        let (world, actions_system) = setup();

        let player = contract_address_const::<'player'>();

        let guess: ByteArray = "guess";

        actions_system.submit_guess(1, guess);
    }

    #[test]
    #[should_panic(expected: ('guess cannot be empty', 'ENTRYPOINT_FAILED'))]
    fn test_submit_guess_empty_guess() {
        let (world, actions_system) = setup();

        let player = contract_address_const::<'player'>();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "answer";
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        let guess: ByteArray = "";

        let puzzle = actions_system.get_puzzle(puzzle_id);

        actions_system.submit_guess(puzzle_id, guess);
    }

    #[test]
    #[should_panic(expected: ('Wrong word length', 'ENTRYPOINT_FAILED'))]
    fn test_submit_guess_wrong_word_length() {
        let (world, actions_system) = setup();

        let player = contract_address_const::<'player'>();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "answer";
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        let guess: ByteArray = "wrong";

        testing::set_contract_address(player);
        let res = actions_system.submit_guess(puzzle_id, guess);

        assert(!res, 'Guess should be incorrect');

        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.solve_count == 0, 'wrong solve count');
        assert(puzzle.first_solver == contract_address_const::<0>(), 'wrong first solver');

        let player_stats: PlayerStats = world.read_model(player);

        assert(player_stats.puzzles_solved == 0, 'puzzles_solved should be zero');
        assert(player_stats.total_attempts == 1, 'total_attempts should be one');
        assert(player_stats.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stats.current_streak == 0, 'current_streak should be zero');
        assert(player_stats.hints_used == 0, 'hints_used should be zero');
    }

    #[test]
    fn test_submit_guess_wrong_guess() {
        let (world, actions_system) = setup();

        let player = contract_address_const::<'player'>();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "answer";
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        let guess: ByteArray = "aannsw";

        testing::set_contract_address(player);
        let res = actions_system.submit_guess(puzzle_id, guess);

        assert(!res, 'Guess should be incorrect');

        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.solve_count == 0, 'wrong solve count');
        assert(puzzle.first_solver == contract_address_const::<0>(), 'wrong first solver');

        let player_stats: PlayerStats = world.read_model(player);

        assert(player_stats.puzzles_solved == 0, 'puzzles_solved should be zero');
        assert(player_stats.total_attempts == 1, 'total_attempts should be one');
        assert(player_stats.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stats.current_streak == 0, 'current_streak should be zero');
        assert(player_stats.hints_used == 0, 'hints_used should be zero');
    }

    #[test]
    #[should_panic(expected: ('Invalid letters used', 'ENTRYPOINT_FAILED'))]
    fn test_submit_guess_with_invalid_letters() {
        let (world, actions_system) = setup();

        let player_1 = contract_address_const::<'player_1'>();
        let player_2 = contract_address_const::<'player_2'>();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "answer";
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        let guess: ByteArray = "letter";

        testing::set_contract_address(player_1);
        let res = actions_system.submit_guess(puzzle_id, guess.clone());

        assert(res, 'Guess should be correct');

        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.solve_count == 1, 'wrong solve count');
        assert(puzzle.first_solver == player_1, 'wrong first solver');

        let player_stats: PlayerStats = world.read_model(player_1);

        assert(player_stats.puzzles_solved == 1, 'puzzles_solved should be 1');
        assert(player_stats.total_attempts == 1, 'total_attempts should be one');
        assert(player_stats.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stats.current_streak == 0, 'current_streak should be zero');
        assert(player_stats.hints_used == 0, 'hints_used should be zero');

        // player 2
        testing::set_contract_address(player_2);
        let res = actions_system.submit_guess(puzzle_id, guess);

        assert(res, 'Guess should be correct');

        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.solve_count == 2, 'wrong solve count');
        assert(puzzle.first_solver == player_1, 'wrong first solver');

        let player_stats: PlayerStats = world.read_model(player_1);

        assert(player_stats.puzzles_solved == 1, 'puzzles_solved should be 1');
        assert(player_stats.total_attempts == 1, 'total_attempts should be one');
        assert(player_stats.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stats.current_streak == 0, 'current_streak should be zero');
        assert(player_stats.hints_used == 0, 'hints_used should be zero');
    }

    #[test]
    fn test_submit_guess_correct_guess() {
        let (world, actions_system) = setup();

        let player_1 = contract_address_const::<'player_1'>();
        let player_2 = contract_address_const::<'player_2'>();

        // Create a new puzzle
        let image_hashes = ['image1', 'image2', 'image3', 'image4'].span();
        let answer: ByteArray = "answer";
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone());

        let guess: ByteArray = "answer";

        testing::set_contract_address(player_1);
        let res = actions_system.submit_guess(puzzle_id, guess.clone());

        assert(res, 'Guess should be correct');

        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.solve_count == 1, 'wrong solve count');
        assert(puzzle.first_solver == player_1, 'wrong first solver');

        let player_stats: PlayerStats = world.read_model(player_1);

        assert(player_stats.puzzles_solved == 1, 'puzzles_solved should be 1');
        assert(player_stats.total_attempts == 1, 'total_attempts should be one');
        assert(player_stats.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stats.current_streak == 0, 'current_streak should be zero');
        assert(player_stats.hints_used == 0, 'hints_used should be zero');

        // player 2
        testing::set_contract_address(player_2);
        let res = actions_system.submit_guess(puzzle_id, guess);

        assert(res, 'Guess should be correct');

        let puzzle: Puzzle = world.read_model(puzzle_id);

        assert(puzzle.solve_count == 2, 'wrong solve count');
        assert(puzzle.first_solver == player_1, 'wrong first solver');

        let player_stats: PlayerStats = world.read_model(player_1);

        assert(player_stats.puzzles_solved == 1, 'puzzles_solved should be 1');
        assert(player_stats.total_attempts == 1, 'total_attempts should be one');
        assert(player_stats.tokens_earned == 0, 'tokens_earned should be zero');
        assert(player_stats.current_streak == 0, 'current_streak should be zero');
        assert(player_stats.hints_used == 0, 'hints_used should be zero');
    }

    #[test]
    #[should_panic(expected: ('puzzles cannot be empty', 'ENTRYPOINT_FAILED'))]
    fn test_add_batch_puzzle_empty_array() {
        let (world, actions_system) = setup();

        let puzzles = array![].span();

        actions_system.add_batch_puzzle(puzzles);
    }

    #[test]
    fn test_add_batch_puzzle_single_puzzle() {
        let (world, actions_system) = setup();

        // Create puzzle data
        let puzzle_data = PuzzleData {
            image_hashes: ['image1', 'image2', 'image3', 'image4'].span(), answer: "test",
        };

        let puzzles = array![puzzle_data].span();

        actions_system.add_batch_puzzle(puzzles);

        // Verify the puzzle was created with ID 1
        let puzzle = actions_system.get_puzzle(1);

        assert(puzzle.id == 1, 'wrong puzzle ID');
        assert(puzzle.image_hashes.len() == 4, 'wrong number of image hashes');
        assert(
            puzzle.image_hashes == ['image1', 'image2', 'image3', 'image4'].span(),
            'image hashes do not match',
        );
        assert(puzzle.answer_hash == PuzzleTrait::hash_word("test"), 'answer hash does not match');
        assert(puzzle.word_length == 4, 'wrong word length');
        assert(puzzle.active, 'puzzle should be active');
        assert(puzzle.difficulty == Difficulty::LEVEL_1.into(), 'wrong difficulty level');
        assert(puzzle.solve_count == 0, 'solve count should be zero');
        assert(puzzle.first_solver == contract_address_const::<0>(), 'first solver should be zero');

        // Check game state counter was updated
        let game_state: GameState = world.read_model(GAME_ID);
        assert(game_state.puzzle_count == 1, 'puzzle count should be 1');
    }

    #[test]
    fn test_add_batch_puzzle_multiple_puzzles() {
        let (world, actions_system) = setup();

        // Create multiple puzzle data
        let puzzle_data_1 = PuzzleData {
            image_hashes: ['img1a', 'img1b', 'img1c', 'img1d'].span(), answer: "word",
        };

        let puzzle_data_2 = PuzzleData {
            image_hashes: ['img2a', 'img2b', 'img2c', 'img2d'].span(), answer: "puzzle",
        };

        let puzzle_data_3 = PuzzleData {
            image_hashes: ['img3a', 'img3b', 'img3c', 'img3d'].span(), answer: "game",
        };

        let puzzles = array![puzzle_data_1, puzzle_data_2, puzzle_data_3].span();

        actions_system.add_batch_puzzle(puzzles);

        // Verify all puzzles were created
        let puzzle_1 = actions_system.get_puzzle(1);
        let puzzle_2 = actions_system.get_puzzle(2);
        let puzzle_3 = actions_system.get_puzzle(3);

        // Check first puzzle
        assert(puzzle_1.id == 1, 'wrong puzzle 1 ID');
        assert(
            puzzle_1.image_hashes == ['img1a', 'img1b', 'img1c', 'img1d'].span(),
            'puzzle 1 images do not match',
        );
        assert!(
            puzzle_1.answer_hash == PuzzleTrait::hash_word("word"),
            "puzzle 1 answer hash does not match",
        );
        assert(puzzle_1.word_length == 4, 'puzzle 1 wrong word length');

        // Check second puzzle
        assert(puzzle_2.id == 2, 'wrong puzzle 2 ID');
        assert(
            puzzle_2.image_hashes == ['img2a', 'img2b', 'img2c', 'img2d'].span(),
            'puzzle 2 images do not match',
        );
        assert!(
            puzzle_2.answer_hash == PuzzleTrait::hash_word("puzzle"),
            "puzzle 2 answer hash does not match",
        );
        assert(puzzle_2.word_length == 6, 'puzzle 2 wrong word length');

        // Check third puzzle
        assert(puzzle_3.id == 3, 'wrong puzzle 3 ID');
        assert(
            puzzle_3.image_hashes == ['img3a', 'img3b', 'img3c', 'img3d'].span(),
            'puzzle 3 images do not match',
        );
        assert!(
            puzzle_3.answer_hash == PuzzleTrait::hash_word("game"),
            "puzzle 3 answer hash does not match",
        );
        assert(puzzle_3.word_length == 4, 'puzzle 3 wrong word length');

        // All should have default properties
        assert(
            puzzle_1.active && puzzle_2.active && puzzle_3.active, 'all puzzles should be active',
        );
        assert!(
            puzzle_1.difficulty == Difficulty::LEVEL_1.into()
                && puzzle_2.difficulty == Difficulty::LEVEL_1.into()
                && puzzle_3.difficulty == Difficulty::LEVEL_1.into(),
            "all puzzles should have LEVEL_1 difficulty",
        );
        assert!(
            puzzle_1.solve_count == 0 && puzzle_2.solve_count == 0 && puzzle_3.solve_count == 0,
            "all puzzles should have zero solve count",
        );

        // Check game state counter was updated correctly
        let game_state: GameState = world.read_model(GAME_ID);
        assert(game_state.puzzle_count == 3, 'puzzle count should be 3');
    }

    #[test]
    #[should_panic(expected: ('Need exactly 4 images', 'ENTRYPOINT_FAILED'))]
    fn test_add_batch_puzzle_invalid_image_count() {
        let (world, actions_system) = setup();

        // Create puzzle data with wrong number of images
        let puzzle_data = PuzzleData {
            image_hashes: ['image1', 'image2'].span(), // Only 2 images instead of 4
            answer: "test",
        };

        let puzzles = array![puzzle_data].span();

        actions_system.add_batch_puzzle(puzzles);
    }

    #[test]
    #[should_panic(expected: ('Answer cannot be empty', 'ENTRYPOINT_FAILED'))]
    fn test_add_batch_puzzle_empty_answer() {
        let (world, actions_system) = setup();

        // Create puzzle data with empty answer
        let puzzle_data = PuzzleData {
            image_hashes: ['image1', 'image2', 'image3', 'image4'].span(), answer: "",
        };

        let puzzles = array![puzzle_data].span();

        actions_system.add_batch_puzzle(puzzles);
    }

    #[test]
    fn test_add_batch_puzzle_mixed_with_existing_puzzles() {
        let (world, actions_system) = setup();

        // First create a single puzzle manually
        let image_hashes = ['manual1', 'manual2', 'manual3', 'manual4'].span();
        let answer: ByteArray = "manual";
        let puzzle_id_1 = actions_system.create_puzzle(image_hashes, answer);

        assert(puzzle_id_1 == 1, 'first puzzle should have ID 1');

        // Now add batch puzzles
        let puzzle_data_1 = PuzzleData {
            image_hashes: ['batch1', 'batch2', 'batch3', 'batch4'].span(), answer: "batch",
        };

        let puzzle_data_2 = PuzzleData {
            image_hashes: ['second1', 'second2', 'second3', 'second4'].span(), answer: "second",
        };

        let puzzles = array![puzzle_data_1, puzzle_data_2].span();
        actions_system.add_batch_puzzle(puzzles);

        // Verify all puzzles exist with correct IDs
        let manual_puzzle = actions_system.get_puzzle(1);
        let batch_puzzle_1 = actions_system.get_puzzle(2);
        let batch_puzzle_2 = actions_system.get_puzzle(3);

        assert(
            manual_puzzle.answer_hash == PuzzleTrait::hash_word("manual"),
            'manual puzzle wrong answer',
        );
        assert(
            batch_puzzle_1.answer_hash == PuzzleTrait::hash_word("batch"),
            'batch puzzle 1 wrong answer',
        );
        assert(
            batch_puzzle_2.answer_hash == PuzzleTrait::hash_word("second"),
            'batch puzzle 2 wrong answer',
        );

        // Check final game state
        let game_state: GameState = world.read_model(GAME_ID);
        assert!(game_state.puzzle_count == 3, "final puzzle count should be 3");
    }

    #[test]
    fn test_add_batch_puzzle_different_word_lengths() {
        let (world, actions_system) = setup();

        // Create puzzles with different word lengths
        let puzzle_data_1 = PuzzleData {
            image_hashes: ['img1a', 'img1b', 'img1c', 'img1d'].span(), answer: "cat" // 3 letters
        };

        let puzzle_data_2 = PuzzleData {
            image_hashes: ['img2a', 'img2b', 'img2c', 'img2d'].span(),
            answer: "elephant" // 8 letters
        };

        let puzzle_data_3 = PuzzleData {
            image_hashes: ['img3a', 'img3b', 'img3c', 'img3d'].span(), answer: "a" // 1 letter
        };

        let puzzles = array![puzzle_data_1, puzzle_data_2, puzzle_data_3].span();

        actions_system.add_batch_puzzle(puzzles);

        // Verify word lengths are correct
        let puzzle_1 = actions_system.get_puzzle(1);
        let puzzle_2 = actions_system.get_puzzle(2);
        let puzzle_3 = actions_system.get_puzzle(3);

        assert(puzzle_1.word_length == 3, 'puzzle 1 should have length 3');
        assert(puzzle_2.word_length == 8, 'puzzle 2 should have length 8');
        assert(puzzle_3.word_length == 1, 'puzzle 3 should have length 1');
    }
}
