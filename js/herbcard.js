function calcHerbCard(format, machines, scoresCounting, attempts, unlimited, qualHours) {
	/*
	Number of machines: M
	Hours of qualifying: H
	Entry style: S (Unlimited Best Game / Hybrid Best Game / Limited Best Game / Unlimited Card / Limited Card)
	Number of entries: E (disabled for Unlimited; locked to M x 4 for Hybrid)
	Scores counted: C

	tgpPct = 0;
	certifiedEligible = false;

	if (S == Unlimited Best Game) {
		if (H >= 20) {
			tgpPct += 8 * C;
			if (C >= 5) {
				certifiedEligible = true;
			}
		} else {
			tgpPct += 4 * C;
		}
		tgpPct += min(20, H);
	} elseif (S == Unlimited Card) {
		if (H >= 20) {
			tgpPct += 16 * C;
			if (C >= 5) {
				certifiedEligible = true;
			}
		} else {
			tgpPct += 4 * C;
		}
		tgpPct += min(20, H);
	} elseif (S == Hybrid Best Game) {
		tgpPct += 12 * C;
		if (C >= 5 && H >= 20) {
			certifiedEligible = true;
		}
	} elseif (S == Limited Best Game || S == Limited Card) {
		tgpPct += 4 * C;
		if (C >= 5 && H >= 20 && E >= 2 * M) {
			certifiedEligible = true;
		}
	}
	*/
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
	document.getElementById("formatBoost").innerHTML = (tgpBase / 4) + "X";
	document.getElementById("subTGPTotal").innerHTML = (subTGP > 200 ? "200.00% (maxed - " + subTGP.toFixed(2) + "%)" : subTGP.toFixed(2) + "%")
	document.getElementById("qualTimeBoost").innerHTML = qualTimeBoost + ".00%";
	
	document.getElementById("finalTGP").innerHTML = (tgp > 200 ? "200.00% (maxed - " + tgp.toFixed(2) + "%)" : tgp.toFixed(2) + "%");
	document.getElementById("attCertified").innerHTML = certifiedEligible;
	document.getElementById("certReq").innerHTML = "Min. " + machines * 2 + " attempts, 20+ qual hrs";
	document.getElementById("attHybrid").innerHTML = machines * 4;
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
