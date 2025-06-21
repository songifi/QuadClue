use quad_clue::models::{Puzzle, PlayerStats, Difficulty};
use starknet::{ContractAddress};

#[starknet::interface]
pub trait IActions<T> {
    fn create_puzzle(
        ref self: T, image_hashes: Span<felt252>, answer: ByteArray, difficulty: Difficulty,
    ) -> u64;

    fn submit_guess(ref self: T, puzzle_id: u64, guess: ByteArray) -> bool;

    // View functions
    fn get_puzzle(self: @T, puzzle_id: u64) -> Puzzle;
    fn get_player_stats(self: @T, player: ContractAddress) -> PlayerStats;
    fn get_puzzle_layout(self: @T, puzzle_id: u64) -> (Span<felt252>, u8, Span<felt252>);
}

// dojo decorator
#[dojo::contract]
pub mod actions {
    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    // #[abi(embed_v0)]
    // impl ActionsImpl of IActions<ContractState> {

    // }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"quad_clue")
        }
    }
}
