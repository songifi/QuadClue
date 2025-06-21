import { DojoProvider } from "@dojoengine/core";
import { BurnerManager } from "@dojoengine/create-burner";
import { Account, RpcProvider, cairo } from "starknet";
import { dojoConfig } from "./config";
import { Puzzle, PlayerStats, PuzzleData } from "@/types/game";

class QuadClueDojoClient {
  private static instance: QuadClueDojoClient;
  public provider: RpcProvider;
  public dojoProvider: DojoProvider;
  public burnerManager: BurnerManager;
  public masterAccount: Account;

  private constructor() {
    this.provider = new RpcProvider({
      nodeUrl: dojoConfig.rpcUrl,
    });

    this.dojoProvider = new DojoProvider({
      ...dojoConfig,
      provider: this.provider,
    });

    this.masterAccount = new Account(
      this.provider,
      dojoConfig.masterAccount.address,
      dojoConfig.masterAccount.privateKey
    );

    this.burnerManager = new BurnerManager({
      masterAccount: this.masterAccount,
      accountClassHash: dojoConfig.accountClassHash,
      provider: this.provider,
    });
  }

  public static getInstance(): QuadClueDojoClient {
    if (!QuadClueDojoClient.instance) {
      QuadClueDojoClient.instance = new QuadClueDojoClient();
    }
    return QuadClueDojoClient.instance;
  }

  // Game-specific methods
  async createPuzzle(
    account: Account,
    imageHashes: string[],
    answer: string
  ): Promise<bigint> {
    if (imageHashes.length !== 4) {
      throw new Error("Need exactly 4 images");
    }

    try {
      const result = await this.dojoProvider.execute(
        account,
        "actions",
        "create_puzzle",
        [imageHashes.map((hash) => cairo.felt(hash)), cairo.byteArray(answer)]
      );

      await this.provider.waitForTransaction(result.transaction_hash);

      // Extract puzzle_id from transaction receipt/events
      // This would need to be parsed from the transaction receipt
      return BigInt(result.transaction_hash); // Placeholder - implement proper parsing
    } catch (error) {
      console.error("Failed to create puzzle:", error);
      throw error;
    }
  }

  async addBatchPuzzle(account: Account, puzzles: PuzzleData[]): Promise<void> {
    try {
      const puzzleSpan = puzzles.map((puzzle) => ({
        image_hashes: puzzle.image_hashes.map((hash) => cairo.felt(hash)),
        answer: cairo.byteArray(puzzle.answer),
      }));

      const result = await this.dojoProvider.execute(
        account,
        "actions",
        "add_batch_puzzle",
        [puzzleSpan]
      );

      await this.provider.waitForTransaction(result.transaction_hash);
    } catch (error) {
      console.error("Failed to add batch puzzles:", error);
      throw error;
    }
  }

  async submitGuess(
    account: Account,
    puzzleId: bigint,
    guess: string
  ): Promise<boolean> {
    try {
      const result = await this.dojoProvider.execute(
        account,
        "actions",
        "submit_guess",
        [cairo.uint256(puzzleId), cairo.byteArray(guess)]
      );

      await this.provider.waitForTransaction(result.transaction_hash);

      // Parse the result to get the boolean return value
      // This would need to be extracted from the transaction receipt
      return true; // Placeholder - implement proper parsing
    } catch (error) {
      console.error("Failed to submit guess:", error);
      throw error;
    }
  }

  async getPuzzle(puzzleId: bigint): Promise<Puzzle> {
    try {
      const result = await this.dojoProvider.call("actions", "get_puzzle", [
        cairo.uint256(puzzleId),
      ]);

      return this.parsePuzzle(result);
    } catch (error) {
      console.error("Failed to get puzzle:", error);
      throw error;
    }
  }

  async getPlayerStats(playerAddress: string): Promise<PlayerStats> {
    try {
      const result = await this.dojoProvider.call(
        "actions",
        "get_player_stats",
        [cairo.felt(playerAddress)]
      );

      return this.parsePlayerStats(result);
    } catch (error) {
      console.error("Failed to get player stats:", error);
      throw error;
    }
  }

  async getPuzzleLayout(puzzleId: bigint): Promise<{
    imageHashes: string[];
    wordLength: number;
    availableLetters: string[];
  }> {
    try {
      const result = await this.dojoProvider.call(
        "actions",
        "get_puzzle_layout",
        [cairo.uint256(puzzleId)]
      );

      return {
        imageHashes: result[0],
        wordLength: Number(result[1]),
        availableLetters: result[2],
      };
    } catch (error) {
      console.error("Failed to get puzzle layout:", error);
      throw error;
    }
  }

  // Helper methods to parse contract responses
  private parsePuzzle(data: any): Puzzle {
    return {
      id: BigInt(data.id),
      image_hashes: data.image_hashes,
      answer_hash: data.answer_hash,
      word_length: Number(data.word_length),
      available_letters: data.available_letters,
      active: data.active,
      difficulty: data.difficulty,
      creation_time: BigInt(data.creation_time),
      solve_count: Number(data.solve_count),
      first_solver: data.first_solver,
    };
  }

  private parsePlayerStats(data: any): PlayerStats {
    return {
      puzzles_solved: Number(data.puzzles_solved),
      total_attempts: Number(data.total_attempts),
      current_streak: Number(data.current_streak),
    };
  }
}

export const quadClueClient = QuadClueDojoClient.getInstance();
