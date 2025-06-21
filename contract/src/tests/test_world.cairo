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
        m_GuessAttempt, Difficulty, PuzzleTrait,
    };

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
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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
        assert(puzzle.difficulty == difficulty.into(), 'wrong difficulty level');
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
        let difficulty = Difficulty::LEVEL_1;

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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
        assert(puzzle.difficulty == difficulty.into(), 'wrong difficulty level');
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

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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

        let puzzle_id = actions_system.create_puzzle(image_hashes, answer.clone(), difficulty);

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
}
