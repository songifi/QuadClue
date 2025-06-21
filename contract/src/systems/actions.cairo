#[starknet::interface]
pub trait IActions<T> {}

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
