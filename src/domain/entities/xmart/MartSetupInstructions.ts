/** What the user creates in xMART to set up a mart for the app: the pipeline's code and its XML definition. */
export type MartSetupInstructions = Readonly<{ pipelineCode: string; definition: string }>;
