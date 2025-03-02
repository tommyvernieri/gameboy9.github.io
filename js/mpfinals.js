function calcKnockoutTournament(players, player1Bye, player2Bye, groupSize, roundGames, advNextRound) {
	// First make sure the parameters are valid.
	// Part 1:  Establish number of players in round 1, then figure it out for round 2, then finally round 3.
	let playersPerRoundDesc = "";
	let playersPerRound = "";
	let invalid = "";
	if (player1Bye > players)
		invalid += "<br># receiving 1 bye exceeds total players";
	else if (player2Bye > players)
		invalid += "<br># receiving 2 byes exceeds total players";
	else if (player2Bye > player1Bye)
		invalid += "<br># receiving 2 byes exceeds # receiving 1 bye";
	
	let round1Players = players - player1Bye - player2Bye;
	if (round1Players <= 0)
		invalid += "<br># receiving any byes exceeds total players";
	
	if (invalid === "") {
		let rounds = 1;
		let avgRounds = 0.00;
		let mGames = 0.0;
		// Force a reduction in the # of players advancing if the original value results in an infinite loop
		let round2Players = (Math.ceil(round1Players / groupSize) * advNextRound) + player1Bye;
		if (round2Players >= round1Players && player1Bye === 0) {
			advNextRound--;
			round2Players = (Math.ceil(round1Players / groupSize) * advNextRound) + player1Bye;
		}
		// Determine % chance someone coming out of rounds 1 or 2 would win the tournament and assess expected number of rounds accordingly.
		let roundPortion2 = (round2Players * advNextRound / groupSize) / ((round2Players * advNextRound / groupSize) + player2Bye);
		let roundPortion1 = (round1Players * advNextRound / groupSize) / ((round1Players * advNextRound / groupSize) + player1Bye) * roundPortion2;
		
		let p3Games = p3GameCalc(round1Players, groupSize);
		let p4Games = p4GameCalc(round1Players, groupSize, p3Games);
		mGames += mGamesCalc(roundPortion1, roundGames, p3Games, p4Games, groupSize);

		playersPerRoundDesc = "Round 1";
		playersPerRound = (p3Games >= p4Games ? "<font color='red'>" : "") + round1Players.toString() + " <i>(" + mGames.toFixed(1) + " M. games)</i>" + (p3Games >= p4Games ? "</font>" : "");

		if (round2Players > 0) 
		{
			avgRounds = roundPortion1 + roundPortion2;
			rounds = 2;

			let roundMGames = 0.0;
			p3Games = p3GameCalc(round2Players, groupSize);
			p4Games = p4GameCalc(round2Players, groupSize, p3Games);
			roundMGames = mGamesCalc(roundPortion2, roundGames, p3Games, p4Games, groupSize);

			mGames += roundMGames;

			playersPerRoundDesc += "<br>Round 2";
			playersPerRound += "<br>" + (p3Games >= p4Games ? "<font color='red'>" : "") + round2Players.toString() + " <i>(" + roundMGames.toFixed(1) + " M. games)</i>" + (p3Games >= p4Games ? "</font>" : "");

			// Force a reduction in the # of players advancing if the original value results in an infinite loop
			let numPlayers = (Math.ceil(round2Players / groupSize) * advNextRound) + player2Bye;
			if (numPlayers >= round2Players && player2Bye === 0) {
				advNextRound--;
				numPlayers = (Math.ceil(round1Players / groupSize) * advNextRound) + player2Bye;
			}
			
			if (numPlayers >= groupSize) {
				rounds = 3;
				while (numPlayers >= 2) {
					p3Games = p3GameCalc(numPlayers, groupSize);
					p4Games = p4GameCalc(numPlayers, groupSize, p3Games);
					roundMGames = mGamesCalc(1, roundGames, p3Games, p4Games, groupSize);

					mGames += roundMGames;

					playersPerRoundDesc += "<br>Round " + rounds;
					playersPerRound += "<br>" + (p3Games >= p4Games ? "<font color='red'>" : "") + numPlayers.toString() + " <i>(" + roundMGames.toFixed(1) + " M. games)</i>" + (p3Games >= p4Games ? "</font>" : "");
					let oldPlayers = numPlayers;
					// Force a reduction in the # of players advancing if the original value results in an infinite loop
					if (numPlayers <= groupSize) numPlayers = 0;
					numPlayers = Math.ceil(numPlayers / groupSize) * advNextRound;
					if (numPlayers >= oldPlayers) {
						advNextRound--;
						numPlayers = (Math.ceil(oldPlayers / groupSize) * advNextRound);
					}

					rounds++;
					avgRounds++;
				}
			}
		}
		
		document.getElementById("PlayersByRound1").innerHTML = playersPerRoundDesc;
		document.getElementById("PlayersByRound2").innerHTML = playersPerRound;
		document.getElementById("AvgRounds").innerHTML = avgRounds.toFixed(2);
		document.getElementById("MGames").innerHTML = mGames.toFixed(1);
		document.getElementById("TGP").innerHTML = (Math.round(mGames) * 4).toFixed(2) + "%";
		
	} else {
		document.getElementById("PlayersByRound1").innerHTML = "Players By Round";
		document.getElementById("PlayersByRound2").innerHTML = "Invalid Tournament<br>" + invalid.substring(4);
		document.getElementById("AvgRounds").innerHTML = "";
		document.getElementById("MGames").innerHTML = "";
		document.getElementById("TGP").innerHTML = "";
	}
}

function p3GameCalc(players, groupSize) {
	return (players % groupSize == 0 ? 0 : groupSize - (players % groupSize));
}

function p4GameCalc(players, groupSize, p3Games) {
	return Math.ceil(players / groupSize) - p3Games;
}

function mGamesCalc(portion, roundGames, p3Games, p4Games, groupSize) {
	if (p3Games >= p4Games) 
		return portion * roundGames * (groupSize == 3 ? 1.0 : 1.5);
	else
		return portion * roundGames * (groupSize == 3 ? 1.5 : 2.0);
}

function tgpButton() {
	calcKnockoutTournament(parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("player1Bye").value),
		parseInt(document.getElementById("player2Bye").value),
		parseInt(document.getElementById("groupsize").value),
		parseInt(document.getElementById("roundGames").value),
		parseInt(document.getElementById("advNextRound").value))	
}
