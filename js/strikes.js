class Player {
	constructor(id, topScore) {
		this.id = id;
		this.topScore = topScore;
		this.strikes = 0;
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

function calcKnockoutTournament(players, groupCount, finalStrikes, finalPlayers, p21, p22, p31, p32, p33, p41, p42, p43, p44, type) {	
	let strikeDist = [ 
		[ p21, p22, p22, p22], 
		[ p31, p32, p33, p33], 
		[ p41, p42, p43, p44]
	];

	let topScore = 10000000.0;
	let lowScore = 10000000.0;

	let playerList = [];
	let roundResult = [];
	let finalEndPlayers = [];
	let playerGames = [ 0, 0, 0 ];
	let firstIteration = "";
	let survivingPlayers = players;
	let iterations = 10000;

	for (let h = 0; h < iterations; h++)
	{
		let round = 0;
		let strightGames = 0.0;
		survivingPlayers = players;

		playerList = [];
		for (let i = 0; i < players; i++)
		{
			let p = new Player(i, (lowScore + ((topScore - lowScore) * (i / (players - 1)))));
			playerList.push(p);
		}
		while (survivingPlayers > finalPlayers)
		{
			let singlePlayerMatches = [ 0, 0, 0 ];

			round++;

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
			if (h == 0)
				firstIteration += "R" + round + " -  Players:  " + survivingPlayers + " - 4P:  " + singlePlayerMatches[2] + " - 3P:  " + singlePlayerMatches[1] + " - 2P:  " + singlePlayerMatches[0] + "\r\n";

			playerGames[0] += singlePlayerMatches[0];
			playerGames[1] += singlePlayerMatches[1];
			playerGames[2] += singlePlayerMatches[2];
			strightGames++;
		}
		finalEndPlayers.push(survivingPlayers);
		if (h == 0)
			firstIteration += "End players:  " + survivingPlayers;

		roundResult.push(round);
	}

	//firstIterationDetail.Text = firstIteration;

	let roundAvg = average(roundResult);
	let endPlayersAvg = average(finalEndPlayers);
	let totalGames = playerGames[0] + playerGames[1] + playerGames[2];
	let totalTGP = playerGames[0] + (1.5 * playerGames[1]) + (2 * playerGames[2]);
	let pct5 = parseInt(iterations * 0.05);
	let pct95 = parseInt(iterations * 0.95);
	roundResult.sort();
	finalEndPlayers.sort();

	if (type === 1) {
		document.getElementById("2pGames").innerHTML = (playerGames[0] / iterations).toFixed(2);
		document.getElementById("3pGames").innerHTML = (playerGames[1] / iterations).toFixed(2);
		document.getElementById("4pGames").innerHTML = (playerGames[2] / iterations).toFixed(2);
		document.getElementById("TotalGames").innerHTML = (totalGames / iterations).toFixed(2);
		document.getElementById("MeaningfulGames").innerHTML = (roundAvg * totalTGP / totalGames).toFixed(2);
		if (document.getElementById("finalsQuestion").checked) {
			document.getElementById("ApproxTGP").innerHTML = (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%";
		} else {
			document.getElementById("ApproxTGP").innerHTML = (roundAvg * totalTGP / totalGames * 4 > 100 ? "100.00% (maxed - " + (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%)" : (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%");
		}
		document.getElementById("tgp").style.visibility='hidden';
		document.getElementById("AvgRounds").innerHTML = roundAvg.toFixed(2);
		document.getElementById("ExtremeRounds").innerHTML = Math.min(...roundResult) + " / " + Math.max(...roundResult);
		document.getElementById("ReasonableRounds").innerHTML = roundResult[pct5] + " / " + roundResult[pct95];
		document.getElementById("AvgPlayers").innerHTML = endPlayersAvg.toFixed(2);
		document.getElementById("ExtremePlayers").innerHTML = Math.min(...finalEndPlayers) + " / " + Math.max(...finalEndPlayers);
		document.getElementById("ReasonablePlayers").innerHTML = finalEndPlayers[pct5] + " / " + finalEndPlayers[pct95];
	} else {
		document.getElementById("2pGames2").innerHTML = (playerGames[0] / iterations).toFixed(2);
		document.getElementById("3pGames2").innerHTML = (playerGames[1] / iterations).toFixed(2);
		document.getElementById("4pGames2").innerHTML = (playerGames[2] / iterations).toFixed(2);
		document.getElementById("TotalGames2").innerHTML = (totalGames / iterations).toFixed(2);
		document.getElementById("MeaningfulGames2").innerHTML = (roundAvg * totalTGP / totalGames).toFixed(2);
		document.getElementById("ApproxTGP2").innerHTML = (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%";
		let finalTGP = parseFloat(document.getElementById("ApproxTGP").innerHTML) + parseFloat(document.getElementById("ApproxTGP2").innerHTML);
		document.getElementById("TotalTGP2").innerHTML = (finalTGP > 200 ? "200.00% (maxed - " + finalTGP.toFixed(2) + "%)" : (finalTGP.toFixed(2) + "%"));
		document.getElementById("tgp").style.visibility='visible';
		document.getElementById("AvgRounds2").innerHTML = roundAvg.toFixed(2);
		document.getElementById("ExtremeRounds2").innerHTML = Math.min(...roundResult) + " / " + Math.max(...roundResult);
		document.getElementById("ReasonableRounds2").innerHTML = roundResult[pct5] + " / " + roundResult[pct95];
		document.getElementById("AvgPlayers2").innerHTML = endPlayersAvg.toFixed(2);
		document.getElementById("ExtremePlayers2").innerHTML = Math.min(...finalEndPlayers) + " / " + Math.max(...finalEndPlayers);
		document.getElementById("ReasonablePlayers2").innerHTML = finalEndPlayers[pct5] + " / " + finalEndPlayers[pct95];
	}
}

function tgpButton() {
	calcKnockoutTournament(parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("groupCount").value),
		parseInt(document.getElementById("strikes").value),
		parseInt(document.getElementById("playersLeft").value),
		parseInt(document.getElementById("p21").value),
		parseInt(document.getElementById("p22").value),
		parseInt(document.getElementById("p31").value),
		parseInt(document.getElementById("p32").value),
		parseInt(document.getElementById("p33").value),
		parseInt(document.getElementById("p41").value),
		parseInt(document.getElementById("p42").value),
		parseInt(document.getElementById("p43").value),
		parseInt(document.getElementById("p44").value),
		1)
	
	if (document.getElementById("finalsQuestion").checked) {
		calcKnockoutTournament(parseInt(document.getElementById("playersLeft").value),
			parseInt(document.getElementById("groupCount2").value),
			parseInt(document.getElementById("strikes2").value),
			1,
			parseInt(document.getElementById("p21").value),
			parseInt(document.getElementById("p22").value),
			parseInt(document.getElementById("p31").value),
			parseInt(document.getElementById("p32").value),
			parseInt(document.getElementById("p33").value),
			parseInt(document.getElementById("p41").value),
			parseInt(document.getElementById("p42").value),
			parseInt(document.getElementById("p43").value),
			parseInt(document.getElementById("p44").value),
			2)
	} 
	else 
	{
		document.getElementById("2pGames2").innerHTML = "&nbsp;";
		document.getElementById("3pGames2").innerHTML = "&nbsp;";
		document.getElementById("4pGames2").innerHTML = "&nbsp;";
		document.getElementById("TotalGames2").innerHTML = "&nbsp;";
		document.getElementById("MeaningfulGames2").innerHTML = "&nbsp;";
		document.getElementById("ApproxTGP2").innerHTML = "&nbsp;";
		document.getElementById("TotalTGP2").innerHTML = "&nbsp;";
		document.getElementById("tgp").style.visibility='hidden';
		document.getElementById("AvgRounds2").innerHTML = "&nbsp;";
		document.getElementById("ExtremeRounds2").innerHTML = "&nbsp;";
		document.getElementById("ReasonableRounds2").innerHTML = "&nbsp;";
		document.getElementById("AvgPlayers2").innerHTML = "&nbsp;";
		document.getElementById("ExtremePlayers2").innerHTML = "&nbsp;";
		document.getElementById("ReasonablePlayers2").innerHTML = "&nbsp;";
	}
	
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
