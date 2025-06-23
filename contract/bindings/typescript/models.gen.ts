import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from 'starknet';

// Type definition for `quad_clue::models::GameState` struct
export interface GameState {
	id: BigNumberish;
	puzzle_count: BigNumberish;
}

// Type definition for `quad_clue::models::GameStateValue` struct
export interface GameStateValue {
	puzzle_count: BigNumberish;
}

// Type definition for `quad_clue::models::GuessAttempt` struct
export interface GuessAttempt {
	puzzle_id: BigNumberish;
	player: string;
	attempt_count: BigNumberish;
}

// Type definition for `quad_clue::models::GuessAttemptValue` struct
export interface GuessAttemptValue {
	attempt_count: BigNumberish;
}

// Type definition for `quad_clue::models::PlayerStats` struct
export interface PlayerStats {
	player: string;
	puzzles_solved: BigNumberish;
	total_attempts: BigNumberish;
	tokens_earned: BigNumberish;
	current_streak: BigNumberish;
	hints_used: BigNumberish;
}

// Type definition for `quad_clue::models::PlayerStatsValue` struct
export interface PlayerStatsValue {
	puzzles_solved: BigNumberish;
	total_attempts: BigNumberish;
	tokens_earned: BigNumberish;
	current_streak: BigNumberish;
	hints_used: BigNumberish;
}

// Type definition for `quad_clue::models::Puzzle` struct
export interface Puzzle {
	id: BigNumberish;
	image_hashes: Array<BigNumberish>;
	answer_hash: BigNumberish;
	word_length: BigNumberish;
	available_letters: Array<BigNumberish>;
	active: boolean;
	difficulty: BigNumberish;
	creation_time: BigNumberish;
	solve_count: BigNumberish;
	first_solver: string;
}

// Type definition for `quad_clue::models::PuzzleValue` struct
export interface PuzzleValue {
	image_hashes: Array<BigNumberish>;
	answer_hash: BigNumberish;
	word_length: BigNumberish;
	available_letters: Array<BigNumberish>;
	active: boolean;
	difficulty: BigNumberish;
	creation_time: BigNumberish;
	solve_count: BigNumberish;
	first_solver: string;
}

// Type definition for `quad_clue::systems::actions::actions::GuessSubmitted` struct
export interface GuessSubmitted {
	puzzle_id: BigNumberish;
	player: string;
	is_correct: boolean;
	guess_length: BigNumberish;
	timestamp: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::GuessSubmittedValue` struct
export interface GuessSubmittedValue {
	is_correct: boolean;
	guess_length: BigNumberish;
	timestamp: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::PlayerStatsUpdated` struct
export interface PlayerStatsUpdated {
	player: string;
	puzzles_solved: BigNumberish;
	total_attempts: BigNumberish;
	current_streak: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::PlayerStatsUpdatedValue` struct
export interface PlayerStatsUpdatedValue {
	puzzles_solved: BigNumberish;
	total_attempts: BigNumberish;
	current_streak: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::PuzzleCreated` struct
export interface PuzzleCreated {
	puzzle_id: BigNumberish;
	creator: string;
	word_length: BigNumberish;
	difficulty: BigNumberish;
	creation_time: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::PuzzleCreatedValue` struct
export interface PuzzleCreatedValue {
	word_length: BigNumberish;
	difficulty: BigNumberish;
	creation_time: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::PuzzleSolved` struct
export interface PuzzleSolved {
	puzzle_id: BigNumberish;
	solver: string;
	is_first_solver: boolean;
	solve_time: BigNumberish;
	total_attempts: BigNumberish;
	total_solvers: BigNumberish;
}

// Type definition for `quad_clue::systems::actions::actions::PuzzleSolvedValue` struct
export interface PuzzleSolvedValue {
	is_first_solver: boolean;
	solve_time: BigNumberish;
	total_attempts: BigNumberish;
	total_solvers: BigNumberish;
}

export interface SchemaType extends ISchemaType {
	quad_clue: {
		GameState: GameState,
		GameStateValue: GameStateValue,
		GuessAttempt: GuessAttempt,
		GuessAttemptValue: GuessAttemptValue,
		PlayerStats: PlayerStats,
		PlayerStatsValue: PlayerStatsValue,
		Puzzle: Puzzle,
		PuzzleValue: PuzzleValue,
		GuessSubmitted: GuessSubmitted,
		GuessSubmittedValue: GuessSubmittedValue,
		PlayerStatsUpdated: PlayerStatsUpdated,
		PlayerStatsUpdatedValue: PlayerStatsUpdatedValue,
		PuzzleCreated: PuzzleCreated,
		PuzzleCreatedValue: PuzzleCreatedValue,
		PuzzleSolved: PuzzleSolved,
		PuzzleSolvedValue: PuzzleSolvedValue,
	},
}
export const schema: SchemaType = {
	quad_clue: {
		GameState: {
			id: 0,
			puzzle_count: 0,
		},
		GameStateValue: {
			puzzle_count: 0,
		},
		GuessAttempt: {
		puzzle_id: 0,
			player: "",
			attempt_count: 0,
		},
		GuessAttemptValue: {
			attempt_count: 0,
		},
		PlayerStats: {
			player: "",
			puzzles_solved: 0,
			total_attempts: 0,
		tokens_earned: 0,
			current_streak: 0,
			hints_used: 0,
		},
		PlayerStatsValue: {
			puzzles_solved: 0,
			total_attempts: 0,
		tokens_earned: 0,
			current_streak: 0,
			hints_used: 0,
		},
		Puzzle: {
			id: 0,
			image_hashes: [0],
			answer_hash: 0,
			word_length: 0,
			available_letters: [0],
			active: false,
			difficulty: 0,
			creation_time: 0,
			solve_count: 0,
			first_solver: "",
		},
		PuzzleValue: {
			image_hashes: [0],
			answer_hash: 0,
			word_length: 0,
			available_letters: [0],
			active: false,
			difficulty: 0,
			creation_time: 0,
			solve_count: 0,
			first_solver: "",
		},
		GuessSubmitted: {
			puzzle_id: 0,
			player: "",
			is_correct: false,
			guess_length: 0,
			timestamp: 0,
		},
		GuessSubmittedValue: {
			is_correct: false,
			guess_length: 0,
			timestamp: 0,
		},
		PlayerStatsUpdated: {
			player: "",
			puzzles_solved: 0,
			total_attempts: 0,
			current_streak: 0,
		},
		PlayerStatsUpdatedValue: {
			puzzles_solved: 0,
			total_attempts: 0,
			current_streak: 0,
		},
		PuzzleCreated: {
			puzzle_id: 0,
			creator: "",
			word_length: 0,
			difficulty: 0,
			creation_time: 0,
		},
		PuzzleCreatedValue: {
			word_length: 0,
			difficulty: 0,
			creation_time: 0,
		},
		PuzzleSolved: {
			puzzle_id: 0,
			solver: "",
			is_first_solver: false,
			solve_time: 0,
			total_attempts: 0,
			total_solvers: 0,
		},
		PuzzleSolvedValue: {
			is_first_solver: false,
			solve_time: 0,
			total_attempts: 0,
			total_solvers: 0,
		},
	},
};
export enum ModelsMapping {
	GameState = 'quad_clue-GameState',
	GameStateValue = 'quad_clue-GameStateValue',
	GuessAttempt = 'quad_clue-GuessAttempt',
	GuessAttemptValue = 'quad_clue-GuessAttemptValue',
	PlayerStats = 'quad_clue-PlayerStats',
	PlayerStatsValue = 'quad_clue-PlayerStatsValue',
	Puzzle = 'quad_clue-Puzzle',
	PuzzleValue = 'quad_clue-PuzzleValue',
	GuessSubmitted = 'quad_clue-GuessSubmitted',
	GuessSubmittedValue = 'quad_clue-GuessSubmittedValue',
	PlayerStatsUpdated = 'quad_clue-PlayerStatsUpdated',
	PlayerStatsUpdatedValue = 'quad_clue-PlayerStatsUpdatedValue',
	PuzzleCreated = 'quad_clue-PuzzleCreated',
	PuzzleCreatedValue = 'quad_clue-PuzzleCreatedValue',
	PuzzleSolved = 'quad_clue-PuzzleSolved',
	PuzzleSolvedValue = 'quad_clue-PuzzleSolvedValue',
}