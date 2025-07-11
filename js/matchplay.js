class Player {
	constructor(id, topScore) {
		this.id = id;
		this.topScore = topScore;
		this.points = 0;
		this.score = 0;
	}
}

function calcKnockoutTournament(players, groupSize, rounds, p21, p22, p31, p32, p33, p41, p42, p43, p44, ABye, AQual, BQual, CQual, DQual) {	
	let strikeDist = [ 
		[ p21, p22, p22, p22], 
		[ p31, p32, p33, p33], 
		[ p41, p42, p43, p44]
	];
	
	if (ABye > players) ABye = players;
	if (AQual > players) AQual = players;
	if (BQual > players) BQual = players;
	if (CQual > players) CQual = players;
	if (DQual > players) DQual = players;
	
	let ATopDist = [];
	let AByeDist = [];
	let AQualDist = [];
	let BQualDist = [];
	let CQualDist = [];
	let DQualDist = [];
	
	let topScore = 40000000.0;
	let lowScore = 10000000.0;

	let playerList = [];
	let playerGames = [ 0, 0, 0 ];
	let survivingPlayers = players;
	let iterations = 10000;

	for (let h = 0; h < iterations; h++)
	{
		let currentRound = 0;
		let strightGames = 0.0;
		survivingPlayers = players;

		playerList = [];
		for (let i = 0; i < players; i++)
		{
			let p = new Player(i, (lowScore + ((topScore - lowScore) * (i / (players - 1)))));
			playerList.push(p);
		}
		while (currentRound < rounds)
		{
			let singlePlayerMatches = [ 0, 0, 0 ];

			currentRound++;

			allowed = [...playerList];

			while (allowed.length > 0)
			{
				let match = []
				let matchPlayers = 4;
				if (allowed.length === 9 || allowed.length === 6 || allowed.length === 5 || allowed.length === 3)
					matchPlayers = 3;
				else if (allowed.length ===  2)
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
					match[j].points += strikeDist[matchPlayers - 2][rank];
				}
				
			}

			playerGames[0] += singlePlayerMatches[0];
			playerGames[1] += singlePlayerMatches[1];
			playerGames[2] += singlePlayerMatches[2];
			strightGames++;
		}
		let sortedList = playerList.sort(
			(p1, p2) => (p1.points < p2.points) ? 1 : (p1.points > p2.points) ? -1 : 0);
			
		ATopDist.push(sortedList[0].points);
		AByeDist.push(sortedList[ABye - 1].points);
		AQualDist.push(sortedList[AQual - 1].points);
		BQualDist.push(sortedList[BQual - 1].points);
		CQualDist.push(sortedList[CQual - 1].points);
		DQualDist.push(sortedList[DQual - 1].points);
	}
	
	let pct5 = parseInt(iterations * 0.05);
	let pct95 = parseInt(iterations * 0.95);

	ATopDist.sort(function(a, b) { return a - b; });
	AByeDist.sort(function(a, b) { return a - b; });
	AQualDist.sort(function(a, b) { return a - b; });
	BQualDist.sort(function(a, b) { return a - b; });
	CQualDist.sort(function(a, b) { return a - b; });
	DQualDist.sort(function(a, b) { return a - b; });

	// Before we report the results, let's calculate TGP and certified eligibility.
	let p3Games = p3GameCalc(players, groupSize);
	let p4Games = p4GameCalc(players, groupSize, p3Games);
	// mGamesCalc is from mpfinals.js; the first parameter is 100%.
	let mGames = mGamesCalc(1, rounds, p3Games, p4Games, groupSize);
	
	document.getElementById("MaxPoints").innerHTML = rounds * Math.max(p21, p22, p31, p32, p33, p41, p42, p43, p44);
	document.getElementById("ATopAvg").innerHTML = average(ATopDist);
	document.getElementById("AByeAvg").innerHTML = average(AByeDist);
	document.getElementById("AQualAvg").innerHTML = average(AQualDist);
	document.getElementById("BQualAvg").innerHTML = average(BQualDist);
	document.getElementById("CQualAvg").innerHTML = average(CQualDist);
	document.getElementById("DQualAvg").innerHTML = average(DQualDist);
	document.getElementById("ATop95").innerHTML = ATopDist[pct5] + " / " + ATopDist[pct95];
	document.getElementById("ABye95").innerHTML = AByeDist[pct5] + " / " + AByeDist[pct95];
	document.getElementById("AQual95").innerHTML = AQualDist[pct5] + " / " + AQualDist[pct95];
	document.getElementById("BQual95").innerHTML = BQualDist[pct5] + " / " + BQualDist[pct95];
	document.getElementById("CQual95").innerHTML = CQualDist[pct5] + " / " + CQualDist[pct95];
	document.getElementById("DQual95").innerHTML = DQualDist[pct5] + " / " + DQualDist[pct95];

	document.getElementById("TGP").innerHTML = 
		(p3Games >= p4Games ? "<font color='red'>" : "") + 
		(mGames > 50 ? "200.00% (maxed - " + (Math.round(mGames) * 4).toFixed(2) + "%" : (Math.round(mGames) * 4).toFixed(2) + "%") + 
		(mGames > 25 ? " *" : "") +
		(p3Games >= p4Games ? " (?)</font>" : "");
	document.getElementById("Certified").innerHTML = (players >= 48 && mGames >= 40 ? (players >= 128 ? "Yes (150% ***)" : "Yes (125%)") : "No");
}

function tgpButton() {
	calcKnockoutTournament(parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("groupCount").value),
		parseInt(document.getElementById("rounds").value),
		parseInt(document.getElementById("p21").value),
		parseInt(document.getElementById("p22").value),
		parseInt(document.getElementById("p31").value),
		parseInt(document.getElementById("p32").value),
		parseInt(document.getElementById("p33").value),
		parseInt(document.getElementById("p41").value),
		parseInt(document.getElementById("p42").value),
		parseInt(document.getElementById("p43").value),
		parseInt(document.getElementById("p44").value),
		parseInt(document.getElementById("ABye").value),
		parseInt(document.getElementById("AQual").value),
		parseInt(document.getElementById("BQual").value),
		parseInt(document.getElementById("CQual").value),
		parseInt(document.getElementById("DQual").value))	
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