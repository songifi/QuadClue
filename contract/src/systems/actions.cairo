use quad_clue::models::{Puzzle, PlayerStats, PuzzleData};
use starknet::{ContractAddress};

#[starknet::interface]
pub trait IActions<T> {
    fn create_puzzle(ref self: T, image_hashes: Span<felt252>, answer: ByteArray) -> u64;
    fn add_batch_puzzle(ref self: T, puzzles: Span<PuzzleData>);
    fn submit_guess(ref self: T, puzzle_id: u64, guess: ByteArray) -> bool;
    // View functions
    fn get_puzzle(self: @T, puzzle_id: u64) -> Puzzle;
    fn get_player_stats(self: @T, player: ContractAddress) -> PlayerStats;
    fn get_puzzle_layout(self: @T, puzzle_id: u64) -> (Span<felt252>, u8, Span<felt252>);
}

#[dojo::contract]
pub mod actions {
    use super::{IActions};
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp, contract_address_const,
    };
    use quad_clue::models::{Puzzle, Difficulty, PlayerStats, GameState, PuzzleTrait, PuzzleData};
    use quad_clue::constant::{GAME_ID, MAX_AVAILABLE_LETTERS};

    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct PuzzleCreated {
        #[key]
        pub puzzle_id: u64,
        #[key]
        pub creator: ContractAddress,
        pub word_length: u8,
        pub difficulty: felt252,
        pub creation_time: u64,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct PuzzleSolved {
        #[key]
        pub puzzle_id: u64,
        #[key]
        pub solver: ContractAddress,
        pub is_first_solver: bool,
        pub solve_time: u64,
        pub total_attempts: u32,
        pub total_solvers: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GuessSubmitted {
        #[key]
        pub puzzle_id: u64,
        #[key]
        pub player: ContractAddress,
        pub is_correct: bool,
        pub guess_length: u32,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct PlayerStatsUpdated {
        #[key]
        pub player: ContractAddress,
        pub puzzles_solved: u32,
        pub total_attempts: u32,
        pub current_streak: u32,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn create_puzzle(
            ref self: ContractState, image_hashes: Span<felt252>, answer: ByteArray,
        ) -> u64 {
            let mut world = self.world_default();
            let creator = get_caller_address();

            // Get current puzzle counter
            let mut game_state: GameState = world.read_model(GAME_ID);
            let puzzle_id = game_state.puzzle_count + 1;

            // Validate inputs
            assert(image_hashes.len() == 4, 'Need exactly 4 images');
            assert(answer.len() > 0, 'Answer cannot be empty');

            // Hash answer
            let answer_hash = PuzzleTrait::hash_word(answer.clone());
            let available_letters = PuzzleTrait::generate_available_letters(answer.clone());

            // Create puzzle
            let puzzle = Puzzle {
                id: puzzle_id,
                image_hashes,
                answer_hash,
                word_length: answer.len().try_into().unwrap(),
                available_letters,
                active: true,
                difficulty: Difficulty::LEVEL_1.into(),
                creation_time: get_block_timestamp(),
                solve_count: 0,
                first_solver: contract_address_const::<0>(),
            };

            game_state.puzzle_count = puzzle_id;

            world.write_model(@puzzle);
            world.write_model(@game_state);

            // EMIT EVENT
            world
                .emit_event(
                    @PuzzleCreated {
                        puzzle_id,
                        creator,
                        word_length: puzzle.word_length,
                        difficulty: puzzle.difficulty,
                        creation_time: get_block_timestamp(),
                    },
                );

            puzzle_id
        }

        fn add_batch_puzzle(ref self: ContractState, puzzles: Span<PuzzleData>) {
            let mut world = self.world_default();

            assert(puzzles.len() > 0, 'puzzles cannot be empty');

            for i in 0..puzzles.len() {
                let puzzle = puzzles[i].clone();

                self.create_puzzle(puzzle.image_hashes, puzzle.answer);
            };
        }

        fn submit_guess(ref self: ContractState, puzzle_id: u64, guess: ByteArray) -> bool {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let mut res = false;

            let puzzle: Puzzle = world.read_model(puzzle_id);
            let player_stats: PlayerStats = world.read_model(caller);

            assert(puzzle.active, 'Puzzle is not active'); // TODO: Handle inactive puzzles
            assert(puzzle.id == puzzle_id, 'Invalid puzzle ID');
            assert(guess.len() > 0, 'guess cannot be empty');

            assert(guess.len() == puzzle.word_length.into(), 'Wrong word length');

            assert(
                PuzzleTrait::validate_guess_letters(guess.clone(), puzzle.available_letters),
                'Invalid letters used',
            );

            let is_correct = puzzle.answer_hash == PuzzleTrait::hash_word(guess.clone());

            world
                .emit_event(
                    @GuessSubmitted {
                        puzzle_id,
                        player: caller,
                        is_correct,
                        guess_length: guess.len(),
                        timestamp: get_block_timestamp(),
                    },
                );

            if is_correct {
                // Update puzzle state
                let mut updated_puzzle = puzzle;
                updated_puzzle.solve_count += 1;

                // If first solver, update first_solver
                if updated_puzzle.first_solver == contract_address_const::<0>() {
                    updated_puzzle.first_solver = caller;
                }

                world.write_model(@updated_puzzle);

                // Update player stats
                let mut updated_stats = player_stats;
                updated_stats.puzzles_solved += 1;
                updated_stats.total_attempts += 1;
                world.write_model(@updated_stats);

                world
                    .emit_event(
                        @PuzzleSolved {
                            puzzle_id,
                            solver: caller,
                            is_first_solver: updated_puzzle.first_solver == caller,
                            solve_time: get_block_timestamp(),
                            total_attempts: updated_stats.total_attempts,
                            total_solvers: updated_puzzle.solve_count,
                        },
                    );

                world
                    .emit_event(
                        @PlayerStatsUpdated {
                            player: caller,
                            puzzles_solved: updated_stats.puzzles_solved,
                            total_attempts: updated_stats.total_attempts,
                            current_streak: updated_stats.current_streak,
                        },
                    );
            } else {
                let mut updated_stats = player_stats;
                updated_stats.total_attempts += 1;
                world.write_model(@updated_stats);
            }

            is_correct
        }

        fn get_puzzle(self: @ContractState, puzzle_id: u64) -> Puzzle {
            let mut world = self.world_default();
            let puzzle: Puzzle = world.read_model(puzzle_id);
            puzzle
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> PlayerStats {
            let mut world = self.world_default();
            let player_stats: PlayerStats = world.read_model(player);
            player_stats
        }

        fn get_puzzle_layout(
            self: @ContractState, puzzle_id: u64,
        ) -> (Span<felt252>, u8, Span<felt252>) {
            let mut world = self.world_default();
            let puzzle: Puzzle = self.get_puzzle(puzzle_id);

            (puzzle.image_hashes, puzzle.word_length, puzzle.available_letters)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"quad_clue")
        }
    }
}
