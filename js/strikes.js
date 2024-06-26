window.onload = function() {
	const params = new Proxy(new URLSearchParams(window.location.search), {
	  get: (searchParams, prop) => searchParams.get(prop),
	});

	if (params.tourney1 !== null) 
	{
		let tourneyParams = params.tourney1.split(",");
		if (tourneyParams.length >= 5) 
		{
			console.log(tourneyParams);
			document.getElementById("strikes").value = tourneyParams[4];
			document.getElementById("playerCount").value = tourneyParams[1];
			document.getElementById("playersLeft").value = tourneyParams[2];
			document.getElementById("groupCount").value = tourneyParams[3];
			let strikeFormat = tourneyParams[0];
			if (strikeFormat === "F") document.getElementById("commonFormats").value = 1;
			else if (strikeFormat === "P") document.getElementById("commonFormats").value = 2;
			else if (strikeFormat === "1") document.getElementById("commonFormats").value = 3;
			else if (strikeFormat === "L") document.getElementById("commonFormats").value = 4;
			else if (strikeFormat === "S") document.getElementById("commonFormats").value = 5;
			else if (strikeFormat === "O") document.getElementById("commonFormats").value = 6;
			else document.getElementById("commonFormats").value = 1;

			fillStrikes();
			tgpButton();
		}
	}
}

class Player {
	constructor(id, topScore, strikes) {
		this.id = id;
		this.topScore = topScore;
		this.strikes = strikes;
		this.score = 0;
	}
}

function qualifyQuestion() {
	let finalPlayers = parseInt(document.getElementById("playersLeft").value);
	if (finalPlayers > 1)
		document.getElementById("finals").style.visibility='visible';
	else {
		document.getElementById("finals").style.visibility='hidden';
		document.getElementById("finals2").style.visibility='hidden';
		document.getElementById("finalsQuestion").checked = false;
	}
		
}

function qualifyQuestion2() {
	if (document.getElementById("finalsQuestion").value === "1")
		document.getElementById("finals2").style.visibility='visible';
	else
		document.getElementById("finals2").style.visibility='hidden';
}

function fillStrikes() {
	let value = document.getElementById("commonFormats").value;
	if (value === "1") 
	{
		document.getElementById("p21").value = 0;
		document.getElementById("p22").value = 2;
		document.getElementById("p31").value = 0;
		document.getElementById("p32").value = 1;
		document.getElementById("p33").value = 2;
		document.getElementById("p41").value = 0;
		document.getElementById("p42").value = 1;
		document.getElementById("p43").value = 1;
		document.getElementById("p44").value = 2;
	}
	else if (value === "2")
	{
		document.getElementById("p21").value = 0;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0;
		document.getElementById("p32").value = 1;
		document.getElementById("p33").value = 2;
		document.getElementById("p41").value = 0;
		document.getElementById("p42").value = 1;
		document.getElementById("p43").value = 2;
		document.getElementById("p44").value = 3;
	}
	else if (value === "3")
	{
		document.getElementById("p21").value = 0;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0;
		document.getElementById("p32").value = 0;
		document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0;
		document.getElementById("p42").value = 0;
		document.getElementById("p43").value = 0;
		document.getElementById("p44").value = 1;
	}
	else if (value === "4")
	{
		document.getElementById("p21").value = 0;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0;
		document.getElementById("p32").value = 0;
		document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0;
		document.getElementById("p42").value = 0;
		document.getElementById("p43").value = 1;
		document.getElementById("p44").value = 1;
	}
	else if (value === "5")
	{
		document.getElementById("p21").value = 0;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0;
		document.getElementById("p32").value = 1;
		document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0;
		document.getElementById("p42").value = 0;
		document.getElementById("p43").value = 1;
		document.getElementById("p44").value = 1;
	}
	else if (value === "6")
	{
		document.getElementById("p21").value = 0;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0;
		document.getElementById("p32").value = 1;
		document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0;
		document.getElementById("p42").value = 1;
		document.getElementById("p43").value = 1;
		document.getElementById("p44").value = 1;
	}
}

function calcKnockoutTournament(players, groupCount, finalPlayers, p21, p22, p31, p32, p33, p41, p42, p43, p44) {	
	let finalStrikes1 = parseInt(document.getElementById("strikes").value);
	let finalStrikes2 = parseInt(document.getElementById("strikes2").value);
	let strikeDist = [ 
		[ p21, p22, p22, p22], 
		[ p31, p32, p33, p33], 
		[ p41, p42, p43, p44]
	];

	let roundResult1 = [];
	let finalEndPlayers1 = [];
	let playerGames1 = [ 0, 0, 0 ];

	let roundResult2 = [];
	let finalEndPlayers2 = [];
	let playerGames2 = [ 0, 0, 0 ];
	let iterations = 10000;

	for (let h = 0; h < iterations; h++)
	{
		let survivingPlayers = runTournament(players, groupCount, finalStrikes1, finalPlayers, playerGames1, roundResult1, strikeDist);
		
		finalEndPlayers1.push(survivingPlayers);
		
		if (document.getElementById("finalsQuestion").checked) {
			if (document.getElementById("exactPlayers").checked) {
				let survivingPlayers2 = runTournament(finalPlayers, groupCount, finalStrikes2, 1, playerGames2, roundResult2, strikeDist);
				finalEndPlayers2.push(survivingPlayers2);
			} else {
				let survivingPlayers2 = runTournament(survivingPlayers, groupCount, finalStrikes2, 1, playerGames2, roundResult2, strikeDist);
				finalEndPlayers2.push(survivingPlayers2);
			}
		}
	}

	let roundAvg = average(roundResult1);
	let endPlayersAvg = average(finalEndPlayers1);
	let totalGames = playerGames1[0] + playerGames1[1] + playerGames1[2];
	let totalTGP = playerGames1[0] + (1.5 * playerGames1[1]) + (2 * playerGames1[2]);
	let pct5 = parseInt(iterations * 0.05);
	let pct95 = parseInt(iterations * 0.95);
	roundResult1.sort(function(a, b) {
		return a - b;
	});
	finalEndPlayers1.sort(function(a, b) {
		return a - b;
	});

	document.getElementById("2pGames").innerHTML = (playerGames1[0] / iterations).toFixed(2);
	document.getElementById("3pGames").innerHTML = (playerGames1[1] / iterations).toFixed(2);
	document.getElementById("4pGames").innerHTML = (playerGames1[2] / iterations).toFixed(2);
	document.getElementById("TotalGames").innerHTML = (totalGames / iterations).toFixed(2);
	document.getElementById("MeaningfulGames").innerHTML = (roundAvg * totalTGP / totalGames).toFixed(2);
	if (document.getElementById("finalsQuestion").checked) {
		document.getElementById("ApproxTGP").innerHTML = (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%";
	} else {
		document.getElementById("ApproxTGP").innerHTML = (roundAvg * totalTGP / totalGames * 4 > 100 ? "100.00% (maxed - " + (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%)" : (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%");
	}
	document.getElementById("tgp").style.visibility = 'hidden';
	document.getElementById("AvgRounds").innerHTML = roundAvg.toFixed(2);
	document.getElementById("ExtremeRounds").innerHTML = Math.min(...roundResult1) + " / " + Math.max(...roundResult1);
	document.getElementById("ReasonableRounds").innerHTML = roundResult1[pct5] + " / " + roundResult1[pct95];
	document.getElementById("AvgPlayers").innerHTML = endPlayersAvg.toFixed(2);
	document.getElementById("ExtremePlayers").innerHTML = Math.min(...finalEndPlayers1) + " / " + Math.max(...finalEndPlayers1);
	document.getElementById("ReasonablePlayers").innerHTML = finalEndPlayers1[pct5] + " / " + finalEndPlayers1[pct95];

	if (document.getElementById("finalsQuestion").checked) {
		roundAvg = average(roundResult2);
		endPlayersAvg = average(finalEndPlayers2);
		totalGames = playerGames2[0] + playerGames2[1] + playerGames2[2];
		totalTGP = playerGames2[0] + (1.5 * playerGames2[1]) + (2 * playerGames2[2]);
		let pct5 = parseInt(iterations * 0.05);
		let pct95 = parseInt(iterations * 0.95);
		roundResult2.sort(function(a, b) {
			return a - b;
		});
		finalEndPlayers2.sort(function(a, b) {
			return a - b;
		});

		document.getElementById("2pGames2").innerHTML = (playerGames2[0] / iterations).toFixed(2);
		document.getElementById("3pGames2").innerHTML = (playerGames2[1] / iterations).toFixed(2);
		document.getElementById("4pGames2").innerHTML = (playerGames2[2] / iterations).toFixed(2);
		document.getElementById("TotalGames2").innerHTML = (totalGames / iterations).toFixed(2);
		document.getElementById("MeaningfulGames2").innerHTML = (roundAvg * totalTGP / totalGames).toFixed(2);
		document.getElementById("ApproxTGP2").innerHTML = (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%";
		let finalTGP = parseFloat(document.getElementById("ApproxTGP").innerHTML) + parseFloat(document.getElementById("ApproxTGP2").innerHTML);
		document.getElementById("TotalTGP2").innerHTML = (finalTGP > 200 ? "200.00% (maxed - " + finalTGP.toFixed(2) + "%)" : (finalTGP.toFixed(2) + "%"));
		document.getElementById("tgp").style.visibility='visible';
		document.getElementById("AvgRounds2").innerHTML = roundAvg.toFixed(2);
		document.getElementById("ExtremeRounds2").innerHTML = Math.min(...roundResult2) + " / " + Math.max(...roundResult2);
		document.getElementById("ReasonableRounds2").innerHTML = roundResult2[pct5] + " / " + roundResult2[pct95];
		document.getElementById("AvgPlayers2").innerHTML = endPlayersAvg.toFixed(2);
		document.getElementById("ExtremePlayers2").innerHTML = Math.min(...finalEndPlayers2) + " / " + Math.max(...finalEndPlayers2);
		document.getElementById("ReasonablePlayers2").innerHTML = finalEndPlayers2[pct5] + " / " + finalEndPlayers2[pct95];
	} else {
		document.getElementById("2pGames2").innerHTML = "&nbsp;";
		document.getElementById("3pGames2").innerHTML = "&nbsp;";
		document.getElementById("4pGames2").innerHTML = "&nbsp;";
		document.getElementById("TotalGames2").innerHTML = "&nbsp;";
		document.getElementById("MeaningfulGames2").innerHTML = "&nbsp;";
		document.getElementById("ApproxTGP2").innerHTML = "&nbsp;";
		document.getElementById("TotalTGP2").innerHTML = "&nbsp;";
		document.getElementById("tgp").style.visibility = 'hidden';
		document.getElementById("AvgRounds2").innerHTML = "&nbsp;";
		document.getElementById("ExtremeRounds2").innerHTML = "&nbsp;";
		document.getElementById("ReasonableRounds2").innerHTML = "&nbsp;";
		document.getElementById("AvgPlayers2").innerHTML = "&nbsp;";
		document.getElementById("ExtremePlayers2").innerHTML = "&nbsp;";
		document.getElementById("ReasonablePlayers2").innerHTML = "&nbsp;";
	}

	document.getElementById("copylink").style.visibility = 'visible';
}

function runTournament(players, groupCount, finalStrikes, finalPlayers, playerGames, roundResult, strikeDist) {
	let topScore = 10000000.0;
	let lowScore = 10000000.0;

	let round = 0;
	let strightGames = 0.0;
	let survivingPlayers = players;

	let playerList = [];
	for (let i = 0; i < players; i++)
	{
		let p = new Player(i, (lowScore + ((topScore - lowScore) * (i / (players - 1)))), 0);
		playerList.push(p);
	}
	while (survivingPlayers > finalPlayers)
	{
		let singlePlayerMatches = [ 0, 0, 0 ];

		round++;

		// Clone the playerList array
		allowed = [...playerList];

		while (allowed.length > 1)
		{
			let match = []
			let matchPlayers = 4;
			if (groupCount >= 3 && (allowed.length === 9 || allowed.length === 6 || allowed.length === 5 || allowed.length === 3))
				matchPlayers = 3;
			else if (groupCount === 2 || allowed.length === 2)
				matchPlayers = 2;

			singlePlayerMatches[matchPlayers - 2]++;

			for (let j = 0; j < matchPlayers; j++)
			{
				let chosenPlayer = getRandomInt(allowed.length);
				match.push(allowed[chosenPlayer]);
				match[j].score = getRandomInt(match[j].topScore);
				allowed.splice(chosenPlayer, 1);
			}

			for (let j = 0; j < matchPlayers; j++)
			{
				let rank = 0; // Weird for someone to rank in 0th place, but since arrays are zero-based...
				for (let k = 0; k < matchPlayers; k++)
				{
					if (k == j) continue;
					if (match[j].score < match[k].score) rank++;
				}
				// The old calculator does it this way...
				//rank = (int)((double)match[j].score / match[j].topScore * matchPlayers) + 1;

				// This will carry over to playerList - match[j] is by reference.
				match[j].strikes += strikeDist[matchPlayers - 2][rank];
			}
			
		}
		for (let j = 0; j < playerList.length; j++) 
		{
			if (playerList[j].strikes >= finalStrikes) 
			{
				playerList.splice(j, 1);
				survivingPlayers--;
				j--;
			}				
		}

		playerGames[0] += singlePlayerMatches[0];
		playerGames[1] += singlePlayerMatches[1];
		playerGames[2] += singlePlayerMatches[2];
		strightGames++;
	}
	roundResult.push(round);
	
	return survivingPlayers;
}

function tgpButton() {
	calcKnockoutTournament(parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("groupCount").value),
		parseInt(document.getElementById("playersLeft").value),
		parseInt(document.getElementById("p21").value),
		parseInt(document.getElementById("p22").value),
		parseInt(document.getElementById("p31").value),
		parseInt(document.getElementById("p32").value),
		parseInt(document.getElementById("p33").value),
		parseInt(document.getElementById("p41").value),
		parseInt(document.getElementById("p42").value),
		parseInt(document.getElementById("p43").value),
		parseInt(document.getElementById("p44").value))	
}

function clipboard() {
	let strikes = "";
	let players = document.getElementById("playerCount").value;
	let playersLeft = document.getElementById("playersLeft").value;
	let groupCount = document.getElementById("groupCount").value;
	let strikesCommon = document.getElementById("commonFormats").value;
	let strikeCount = parseInt(document.getElementById("strikes").value);
	if (strikesCommon == "1") strikes = "F";
	if (strikesCommon == "2") strikes = "P";
	if (strikesCommon == "3") strikes = "1";
	if (strikesCommon == "4") strikes = "L";
	if (strikesCommon == "5") strikes = "S";
	if (strikesCommon == "6") strikes = "O";
	
	navigator.clipboard.writeText("https://gameboy9.github.io/strikes.html?tourney1=" + strikes + "," + players + "," + playersLeft + "," + groupCount + "," + strikeCount);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function average(numbers) 
{
	let sum = 0;
	for (let i = 0; i < numbers.length; i++) 
	{
		sum += numbers[i];
	}
	return sum / numbers.length;
}
