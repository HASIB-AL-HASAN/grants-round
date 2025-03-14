import {
  RoundCreated as RoundCreatedEvent
} from "../../generated/Round/RoundFactory"

import { Program, Round, VotingStrategy } from "../../generated/schema";
import { RoundImplementation } from  "../../generated/templates";
import {
  RoundImplementation  as RoundImplementationContract
} from "../../generated/templates/RoundImplementation/RoundImplementation";
import { updateMetaPtr } from "../utils";
import { log } from "@graphprotocol/graph-ts";


/**
 * @dev Handles indexing on RoundCreatedEvent event.
 * @param event RoundCreatedEvent
 */
export function handleRoundCreated(event: RoundCreatedEvent): void {

  const roundContractAddress = event.params.roundAddress;
  let round = Round.load(roundContractAddress.toHex());

  if (round) {
    log.warning("--> handleRoundCreated {} : round already exists", [roundContractAddress.toHex()]);
    return;
  }

  // create new round entity
  round = new Round(roundContractAddress.toHex());

  // load round contract
  const roundContract = RoundImplementationContract.bind(roundContractAddress);

  // index global variables
  round.token = roundContract.token().toHex();
  round.payoutStrategy = roundContract.payoutStrategy().toHex();
  round.applicationsStartTime = roundContract.applicationsStartTime().toString();
  round.applicationsEndTime = roundContract.applicationsEndTime().toString();
  round.roundStartTime = roundContract.roundStartTime().toString();
  round.roundEndTime = roundContract.roundEndTime().toString();

  // set roundMetaPtr
  const roundMetaPtrId = ['roundMetaPtr', roundContractAddress.toHex()].join('-');
  let roundMetaPtr = roundContract.roundMetaPtr();
  let metaPtr = updateMetaPtr(
    roundMetaPtrId,
    roundMetaPtr.getProtocol().toI32(),
    roundMetaPtr.getPointer().toString()
  );
  round.roundMetaPtr = metaPtr.id;

  // set applicationsMetaPtr
  const applicationsMetaPtrId = ['applicationsMetaPtr', roundContractAddress.toHex()].join('-');
  let applicationsMetaPtr = roundContract.applicationMetaPtr();
  metaPtr = updateMetaPtr(
    applicationsMetaPtrId,
    applicationsMetaPtr.getProtocol().toI32(),
    applicationsMetaPtr.getPointer().toString()
  );
  round.applicationMetaPtr = metaPtr.id;


  // link round to program
  const programContractAddress = event.params.ownedBy.toHex();
  let program = Program.load(programContractAddress);
  if (!program) {
    // avoid creating a round if program does not exist
    log.warning("--> handleRoundCreated {} : program {} is null", [roundContractAddress.toHex(), programContractAddress]);
    return;
  }
  round.program = program.id;

  // link round to votingStrategy
  const votingStrategyAddress = roundContract.votingStrategy().toHex();
  const votingStrategy = VotingStrategy.load(votingStrategyAddress);
  if (!votingStrategy) {
    // avoid creating a round if votingStrategy does not exist
    log.warning("--> handleRoundCreated {} : votingStrategy {} is null", [roundContractAddress.toHex(), votingStrategyAddress]);
    return;
  }
  round.votingStrategy = votingStrategy.id;

  round.save();

  RoundImplementation.create(roundContractAddress);
}