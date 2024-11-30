function fillWinnersBracket() {
	let value = document.getElementById("winnersCommonFormats").value;
	if (value === "1") {
		document.getElementById("evw").value = 1;
	} else if (value === "2") {
		document.getElementById("evw").value = 2.5;
	} else if (value === "3") {
		document.getElementById("evw").value = 4;
	} else if (value === "4") {
		document.getElementById("evw").value = 5.5;
	}
}

function fillLosersBracket() {
	let value = document.getElementById("losersCommonFormats").value;
	if (value === "0") {
		document.getElementById("evl").value = 0;
	} else if (value === "1") {
		document.getElementById("evl").value = 1;
	} else if (value === "2") {
		document.getElementById("evl").value = 2.5;
	} else if (value === "3") {
		document.getElementById("evl").value = 4;
	} else if (value === "4") {
		document.getElementById("evl").value = 5.5;
	}
}

function calcWinnersBracket(playersLeft, totalPlayers, fullBracket, evWinnersRound) {
	let ev = 0;

	// Assumes all byes are in the first round
	let expectedSecondRoundPlayers = fullBracket / 2;
	let isSecondWinnersRound = nearlyEqual(playersLeft, expectedSecondRoundPlayers);

	if (isSecondWinnersRound) {

		if (nearlyEqual(totalPlayers, fullBracket)) {
			// If the first round is full then everyone plays a winners round match
			ev = evWinnersRound;

		} else {
			// When the first round is not full, the value coming out of the first round
			// is based on the number of matches played in the first round. Each first round
			// match has either two players or one player and a bye. If all of the first round
			// matches had a bye then the full bracket would be one level smaller.
			let fullBracketFirstRoundMatches = fullBracket / 2;
			let actualFirstRoundMatches = totalPlayers - fullBracketFirstRoundMatches;
			ev = evWinnersRound * (actualFirstRoundMatches / fullBracketFirstRoundMatches);
		}

	} else {
		// Assume everyone plays a winners round match and recurse
		ev = evWinnersRound + calcWinnersBracket(playersLeft * 2, totalPlayers, fullBracket, evWinnersRound);
	}

	return ev;
}

function calcLosersBracket(playersLeft, totalPlayers, fullBracket, evWinnersRound, evLosersRound) {
	// Losers bracket is calculated in round pairs that have this structure:
	//
	//          ________
	//         |           ________
	// ___ev___|          |
	//         |__________|
	//                    |________
	//

	let ev = 0;
	let expectedFirstLosersRoundPlayers = fullBracket / 2;
	let expectedSecondLosersRoundPlayers = expectedFirstLosersRoundPlayers / 2;
	let isFirstLosersRoundPair = nearlyEqual(playersLeft, expectedSecondLosersRoundPlayers);

	let evNewLoser = calcWinnersBracket(playersLeft, totalPlayers, fullBracket, evWinnersRound);

	if (isFirstLosersRoundPair) {

		if (nearlyEqual(totalPlayers, fullBracket)) {
			// A full winners bracket first round leads to this losers bracket structure:
			//
			//          _newLoserEv_
			//         |              _evWinnersRound_
			// ___ev___|             |
			//         |_evAdvLoser__|
			//                       |__evWinnersRound_
			//

			let evAdvancingLoser = evLosersRound + evWinnersRound;
			ev = evLosersRound + 0.5 * (evNewLoser + evAdvancingLoser);

		} else if (nearlyEqual(totalPlayers, fullBracket - expectedSecondLosersRoundPlayers)) {
			// A winners bracket first round with half the typical matches leads to this losers bracket structure:
			//
			//          _newLoserEv_
			//         |                 _evWinnersRound_
			// ___ev___|                |
			//         |_evWinnersRound_|
			//                          |_______bye______
			//
			// The first losers round match is never played because they all have one bye

			let evAdvancingLoser = evWinnersRound;
			ev = evLosersRound + 0.5 * (evNewLoser + evAdvancingLoser);

		} else {
			// The earlier code should be structured to never end up here since this is only
			// intended to be called for a full bracket or a bracket that has byes for half of
			// the first round winners matches. In the minimal case where it's a really large bracket
			// and there's only 1 player more than the smaller bracket size, there's almost 0 ev
			// coming in from the first losers round. Almost all slots are filled by people who played
			// one winners match and advanced through to the second losers round pair.
			//
			// The value used here is just an easy lower bound.			
			ev = evWinnersRound;
		}

	} else {
		// Recurse for values coming from earlier losers rounds
		//
		//          _newLoserEv_
		//         |              _evPrevLoser_
		// ___ev___|             |
		//         |_evAdvLoser__|
		//                       |_evPrevLoser_
		//
		let evAdvancingLoser = evLosersRound + calcLosersBracket(playersLeft * 2, totalPlayers, fullBracket, evWinnersRound, evLosersRound);
		ev = evLosersRound + 0.5 * (evNewLoser + evAdvancingLoser);
	}

	return ev;
}

function calcFullBracket(playerCount) {
	return Math.pow(2, Math.ceil(Math.log2(playerCount)));
}

function linearInterpolation(lowCount, highCount, lowValue, highValue, count) {
	let delta = highValue - lowValue;
	let stepCount = highCount - lowCount;
	return lowValue + delta * (count - lowCount) / stepCount;
}

function calcInterpolatedDoubleElimTournament(players, evWinnersRound, evLosersRound) {
	let ev = 0;
	let fullBracket = calcFullBracket(players);
	let losersBracketRoundOneMatches = fullBracket / 2 / 2;
	let winnersBracketRoundTwoPlayers = fullBracket / 2;
	let losersBracketRoundOnePlayers = players - winnersBracketRoundTwoPlayers;

	let evWofW = calcWinnersBracket(1, players, fullBracket, evWinnersRound);
	let evWofL = 0;
	let lowEv = 0;
	let highEv = 0;

	if (evLosersRound == 0) {
		// This is a single elim tournament.
		ev = calcWinnersBracket(1, players, fullBracket, evWinnersRound);
		evWofL = 0;
		lowEv = evWofL;
		highEv = evWofL;
	} else {
		if (nearlyEqual(players, fullBracket)) {
			// A full bracket.
			evWofL = calcLosersBracket(1, players, fullBracket, evWinnersRound, evLosersRound);
			lowEv = evWofL;
			highEv = evWofL;
		} else if (nearlyEqual(losersBracketRoundOnePlayers, losersBracketRoundOneMatches)) {
			// A bracket with byes evenly distributed across all first losers round matches.
			evWofL = calcLosersBracket(1, players, fullBracket, evWinnersRound, evLosersRound);
			lowEv = evWofL;
			highEv = evWofL;
		} else if (players < fullBracket - losersBracketRoundOneMatches) {
			// A bracket where some first losers round match spaces don't even have a single player.
			// Use linear interpolation with the next smaller bracket size and the byes midpoint of
			// this bracket size.
			let lowCount = fullBracket / 2;
			let highCount = fullBracket - losersBracketRoundOneMatches;
			lowEv = calcLosersBracket(1, lowCount, lowCount, evWinnersRound, evLosersRound);
			highEv = calcLosersBracket(1, highCount, fullBracket, evWinnersRound, evLosersRound);
			evWofL = linearInterpolation(lowCount, highCount, lowEv, highEv, players);
		} else {
			// A bracket where some first losers round matches have two players.
			// Use linear interpolation with the byes midpoint of this bracket size and a full
			// bracket of this size.
			let lowCount = fullBracket - losersBracketRoundOneMatches;
			let highCount = fullBracket;
			lowEv = calcLosersBracket(1, lowCount, fullBracket, evWinnersRound, evLosersRound);
			highEv = calcLosersBracket(1, highCount, fullBracket, evWinnersRound, evLosersRound);
			evWofL = linearInterpolation(lowCount, highCount, lowEv, highEv, players);
		}

		// Calculate the grand finals
		let evSingleMatchGrandFinals = evWofW + evWinnersRound;
		let evTwoMatchGrandFinals = evWinnersRound + evLosersRound + 0.5 * (evWofW + evWofL);
		ev = 0.5 * (evSingleMatchGrandFinals + evTwoMatchGrandFinals);
	}

	// Update display
	document.getElementById("WofWEv").innerHTML = evWofW.toFixed(3);
	document.getElementById("WofLEv").innerHTML = evWofL.toFixed(3);
	document.getElementById("WofLEvLower").innerHTML = lowEv.toFixed(3);
	document.getElementById("WofLEvUpper").innerHTML = highEv.toFixed(3);

	return ev;
}

function printAll(players) {
	const roundEv = [0, 1, 2.5, 4, 5.5];
	let output = "";

	for (let i = 3; i <= players; i++) {
		output = output + i;

		for (let w = 1; w < roundEv.length; w++) {
			for (let l = 0; l <= w; l++) {
				let evWinnersRound = roundEv[w];
				let evLosersRound = roundEv[l];
				let ev = calcInterpolatedDoubleElimTournament(i, evWinnersRound, evLosersRound);
				output = output + "," + ev.toFixed(4);
			}
		}

		output = output + "\n";
	}

	console.log(output);
}

function calcDoubleElimTournament(players, evWinnersRound, evLosersRound) {
	let ev = calcInterpolatedDoubleElimTournament(players, evWinnersRound, evLosersRound);
	document.getElementById("MeaningfulGames").innerHTML = ev.toFixed(3);
	document.getElementById("ApproxTGP").innerHTML = (ev * 4 > 100 ? "100.00% (maxed - " + (ev * 4).toFixed(2) + "%)" : (ev * 4).toFixed(2) + "%");
}

function validateParameters() {
	const minPlayerCount = 3;
	const maxPlayerCount = Math.pow(2, 12);
	let playerCount = parseInt(document.getElementById("playerCount").value);
	if (playerCount < minPlayerCount) {
		alert("Invalid player count. Must have a minimum of " + minPlayerCount + " players.");
		return false;
	}

	if (playerCount > maxPlayerCount) {
		alert("Invalid player count. Must have a maximum of " + maxPlayerCount + " players.");
		return false;
	}

	return true;
}

function tgpButton() {
	var parametersAreValid = validateParameters();
	if (!parametersAreValid) return;

	calcDoubleElimTournament(parseInt(document.getElementById("playerCount").value),
		parseFloat(document.getElementById("evw").value),
		parseFloat(document.getElementById("evl").value));
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function average(numbers) {
	let sum = 0;
	for (let i = 0; i < numbers.length; i++) {
		sum += numbers[i];
	}

	return sum / numbers.length;
}

// Compare two numbers that may have slightly different 
// floating point rounding or representation in memory
function nearlyEqual(a, b) {
	const epsilon = 1e-4;
	if (a == b) return true;
	let diff = Math.abs(a - b);
	return diff < epsilon;
}
