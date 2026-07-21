import type {
  AnalyzeRequest,
  CoachRequest,
  Coaching,
  Handoff,
} from "./contracts";

export const DEFAULT_MODEL = "gpt-5.6-terra";

export type AnalyzeModelInput = Pick<AnalyzeRequest, "sessionText" | "diffText">;

export interface ModelGateway {
  analyze(input: AnalyzeModelInput): Promise<Handoff>;
  coach(input: CoachRequest): Promise<Coaching>;
}

export class ModelUnavailableError extends Error {
  constructor() {
    super("Model dependency unavailable");
    this.name = "ModelUnavailableError";
  }
}
