function calcHerbCard(format, machines, scoresCounting, attempts, unlimited, qualHours) {
	let tgpBase = 4;
	let certifiedEligible = false;
	if (format === 1) // Herb / Best Game
	{
		if (attempts === machines * 4 && !unlimited) 
			tgpBase = 12;
		else if (qualHours >= 20 && unlimited) 
			tgpBase = 8;
		
		if (qualHours >= 20 && scoresCounting >= 5 && (unlimited || attempts >= machines * 2)) 
			certifiedEligible = true;
	}
	else // Card 
	{
		if (qualHours >= 20 && unlimited) 
			tgpBase = 16;
		if (qualHours >= 20 && scoresCounting >= 5 && (unlimited || attempts >= machines * 2)) 
			certifiedEligible = true;
	}
	console.log(qualHours);
	let qualTimeBoost = unlimited === true ? Math.min(qualHours, 20) : 0
	let subTGP = tgpBase * scoresCounting
	let tgp = subTGP + qualTimeBoost;

	document.getElementById("meaningfulGames").innerHTML = scoresCounting + " (" + scoresCounting * 4 + ".00% TGP)";
	document.getElementById("formatBoost").innerHTML = (tgpBase / 4) + "X" + (tgpBase === 8 ? " (Unlimited Herb)" : tgpBase === 12 ? " (Hybrid) ***" : tgpBase === 16 ? " (Unlimited Card)" : "");
	document.getElementById("subTGPTotal").innerHTML = (subTGP > 200 ? "200.00% (maxed - " + subTGP.toFixed(2) + "%)" : subTGP.toFixed(2) + "%")
	document.getElementById("qualTimeBoost").innerHTML = qualTimeBoost + ".00%";
	
	document.getElementById("finalTGP").innerHTML = (tgp > 200 ? "200.00% (maxed - " + tgp.toFixed(2) + "%)" : tgp.toFixed(2) + "%");
	document.getElementById("attCertified").innerHTML = certifiedEligible;
	document.getElementById("certReq").innerHTML = "Min. " + machines * 2 + " attempts, 20+ qual hrs";
	document.getElementById("attHybrid").innerHTML = machines * 4;
	document.getElementById("maxMachine").innerHTML = qualHours * 7.5; // 8 minutes per machine
	document.getElementById("maxOverall").innerHTML = machines * qualHours * 7.5; // 8 minutes per machine
	document.getElementById("maxPlayers").innerHTML = (unlimited ? "N/A" : Math.floor(machines * qualHours * 7.5 / attempts));
}


function validateParameters() {
	return true;
}

function tgpButton() {
	var parametersAreValid = validateParameters();
	if (!parametersAreValid) return;

	calcHerbCard(parseInt(document.getElementById("commonFormats").value),
		parseInt(document.getElementById("machines").value),
		parseInt(document.getElementById("scoresCounting").value),
		parseInt(document.getElementById("attempts").value),
		document.getElementById("unlimited").checked,
		parseInt(document.getElementById("qualHours").value));
}
