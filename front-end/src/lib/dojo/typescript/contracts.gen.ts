import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_addBatchPuzzle_calldata = (puzzles: Array<PuzzleData>): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "add_batch_puzzle",
			calldata: [puzzles],
		};
	};

	const actions_addBatchPuzzle = async (snAccount: Account | AccountInterface, puzzles: Array<PuzzleData>) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_addBatchPuzzle_calldata(puzzles),
				"quad_clue",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_createPuzzle_calldata = (imageHashes: Array<BigNumberish>, answer: ByteArray): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "create_puzzle",
			calldata: [imageHashes, answer],
		};
	};

	const actions_createPuzzle = async (snAccount: Account | AccountInterface, imageHashes: Array<BigNumberish>, answer: ByteArray) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_createPuzzle_calldata(imageHashes, answer),
				"quad_clue",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getPlayerStats_calldata = (player: string): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_player_stats",
			calldata: [player],
		};
	};

	const actions_getPlayerStats = async (player: string) => {
		try {
			return await provider.call("quad_clue", build_actions_getPlayerStats_calldata(player));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getPuzzle_calldata = (puzzleId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_puzzle",
			calldata: [puzzleId],
		};
	};

	const actions_getPuzzle = async (puzzleId: BigNumberish) => {
		try {
			return await provider.call("quad_clue", build_actions_getPuzzle_calldata(puzzleId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getPuzzleLayout_calldata = (puzzleId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_puzzle_layout",
			calldata: [puzzleId],
		};
	};

	const actions_getPuzzleLayout = async (puzzleId: BigNumberish) => {
		try {
			return await provider.call("quad_clue", build_actions_getPuzzleLayout_calldata(puzzleId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_submitGuess_calldata = (puzzleId: BigNumberish, guess: ByteArray): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "submit_guess",
			calldata: [puzzleId, guess],
		};
	};

	const actions_submitGuess = async (snAccount: Account | AccountInterface, puzzleId: BigNumberish, guess: ByteArray) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_submitGuess_calldata(puzzleId, guess),
				"quad_clue",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			addBatchPuzzle: actions_addBatchPuzzle,
			buildAddBatchPuzzleCalldata: build_actions_addBatchPuzzle_calldata,
			createPuzzle: actions_createPuzzle,
			buildCreatePuzzleCalldata: build_actions_createPuzzle_calldata,
			getPlayerStats: actions_getPlayerStats,
			buildGetPlayerStatsCalldata: build_actions_getPlayerStats_calldata,
			getPuzzle: actions_getPuzzle,
			buildGetPuzzleCalldata: build_actions_getPuzzle_calldata,
			getPuzzleLayout: actions_getPuzzleLayout,
			buildGetPuzzleLayoutCalldata: build_actions_getPuzzleLayout_calldata,
			submitGuess: actions_submitGuess,
			buildSubmitGuessCalldata: build_actions_submitGuess_calldata,
		},
	};
}