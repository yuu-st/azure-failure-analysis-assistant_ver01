// This file is wrapper of Azure SDK.
import {split} from 'lodash';


// This method is to transform from Rows type to CSV.
// Because Rows type makes prompt's context more big.
// So we need to decrease token size by transformation.
/*
function rowsToCSV(rows: Row[]) {
  return rows
    .map((row) => row.Data!.map((data) => data.VarCharValue).join(","))
    .join("\n");
}


// For X-Ray
export async function queryToXray(
  startDate: string,
  endDate: string,
  outputKey: string
) {
  logger.info("Start", {funciton: queryToXray.name, input: {startDate, endDate, outputKey}});
  const client = new XRayClient();
  const input = {
    StartTime: new Date(startDate),
    EndTime: new Date(endDate),
    TimeRangeType: TimeRangeType.Event
  };
  let command = new GetTraceSummariesCommand(input);
  let response = await client.send(command);
  const traces = response.TraceSummaries
    ? response.TraceSummaries
    : ([] as TraceSummary[]);

  while (response.NextToken) {
    command = new GetTraceSummariesCommand({
      ...input,
      NextToken: response.NextToken
    });
    response = await client.send(command);
    if (response.TraceSummaries) traces.push(...response.TraceSummaries);
  }

  logger.info("End", {funciton: queryToXray.name, output: {traces}});
  return { key: outputKey, value: traces };
}

export async function listGuardDutyFindings(detectorId: string, outputKey: string) {
  logger.info("Start", {funciton: listGuardDutyFindings.name, input: {detectorId, outputKey}});
  const guarddutyClient = new GuardDutyClient();

  let listFindingsCommandInput: ListFindingsCommandInput = {
    DetectorId: detectorId,
    FindingCriteria: {
      Criterion: {
        severity: {
          GreaterThanOrEqual: 4.0,
        },
      },
    },
  };
  let listFindingsCommand = new ListFindingsCommand(listFindingsCommandInput);
  let listFindingsResponse = await guarddutyClient.send(listFindingsCommand);
  const findingIds = listFindingsResponse.FindingIds
    ? listFindingsResponse.FindingIds
    : [];

  while (listFindingsResponse.NextToken) {
    listFindingsCommandInput = {
      ...listFindingsCommandInput,
      NextToken: listFindingsResponse.NextToken,
    };

    listFindingsCommand = new ListFindingsCommand(listFindingsCommandInput);
    listFindingsResponse = await guarddutyClient.send(listFindingsCommand);
    if (listFindingsResponse.FindingIds)
      findingIds.push(...listFindingsResponse.FindingIds);
  }

  const input: GetFindingsCommandInput = {
    DetectorId: detectorId,
    FindingIds: findingIds,
  };
  const getFindingsResponse = await guarddutyClient.send(new GetFindingsCommand(input));
  const findings = getFindingsResponse.Findings
    ? getFindingsResponse.Findings
    : [];

  logger.info("End", {funciton: listGuardDutyFindings.name, output: {numberOfFindings: findings.length, findings}});
  return { key: outputKey, value: findings };
}

export async function listSecurityHubFindings(outputKey: string) {
  logger.info("Start", {funciton: listSecurityHubFindings.name, input: {outputKey}});
  const securityHubClient = new SecurityHubClient();

  const getSecurityHubFindingsInput: GetSecurityHubFindingsCommandInput = {
    // Refer to configuration of Baseline Environment on AWS
    // https://github.com/aws-samples/baseline-environment-on-aws/blob/ef33275e8961f4305509eccfb7dc8338407dbc9f/usecases/blea-gov-base-ct/lib/construct/detection.ts#L334
    Filters: {
      SeverityLabel: [
        { Comparison: "EQUALS", Value: "CRITICAL" },
        { Comparison: "EQUALS", Value: "HIGH" },
      ],
      ComplianceStatus: [{ Comparison: "EQUALS", Value: "FAILED" }],
      WorkflowStatus: [
        { Comparison: "EQUALS", Value: "NEW" },
        { Comparison: "EQUALS", Value: "NOTIFIED" },
      ],
      RecordState: [{ Comparison: "EQUALS", Value: "ACTIVE" }],
    },
  };
  const getSecurityHubFindingsCommand = new GetSecurityHubFindingsCommand(
    getSecurityHubFindingsInput
  );

  const response = await securityHubClient.send(getSecurityHubFindingsCommand);
  logger.info("End", {funciton: listSecurityHubFindings.name, output: {numberOfFindings: response.Findings?.length, findings: response.Findings}});

  return { key: outputKey, value: response.Findings};
}

export async function converse(
  prompt: string, 
  modelId: string = process.env.MODEL_ID!,
  inferenceConfig: InferenceConfiguration = {
    maxTokens: 2000,
    temperature: 0.1,
    topP: 0.97
  }
){
  logger.info("Start", {funciton: converse.name, input: {prompt, modelId, inferenceConfig}});
  const client = new BedrockRuntimeClient();
  const converseCommandInput :ConverseCommandInput = {
    modelId,
    messages: [
      {
        "role": "user",
        "content": [{"text": prompt}]
      }
    ],
    inferenceConfig,
  }
  try{
    const converseOutput = await client.send(new ConverseCommand(converseCommandInput));
    logger.info("End", {funciton: converse.name, output: {converseOutput}});
    return converseOutput.output?.message?.content![0].text;
  }catch(error){
    logger.error("Something happened", error as Error);
    return "";
  }
}

export async function invokeAsyncLambdaFunc(
  payload: string,
  functionName: string
) {
  logger.info("Start", {funciton: invokeAsyncLambdaFunc.name, input: {payload, functionName}});
  const lambdaClient = new LambdaClient();
  const input: InvokeCommandInputType = {
    FunctionName: functionName,
    InvocationType: "Event",
    Payload: payload
  };
  const invokeCommand = new InvokeCommand(input);
  logger.info("Send command", {command: invokeCommand});
  const res = await lambdaClient.send(invokeCommand);
  logger.info("End", {funciton: invokeAsyncLambdaFunc.name, output: {response: res}});
  return res;
}
*/