class Player {
	constructor(id, topScore) {
		this.id = id;
		this.topScore = topScore;
		this.points = 0;
		this.score = 0;
	}
}

class QueuesManager {
	static manager;

	static createOrUpdate(matchPlayApiKey, ...tournamentIdList) {
		if (QueuesManager.manager === undefined) {
			QueuesManager.manager = new QueuesManager(matchPlayApiKey, ...tournamentIdList);
		} else {
			QueuesManager.matchPlayApiKey = matchPlayApiKey;
			QueuesManager.tournamentIdList = tournamentIdList;
		}
	}

	constructor(matchPlayApiKey, ...tournamentIdList) {
		this.matchPlayApiKey = matchPlayApiKey;
		this.tournamentIdList = tournamentIdList;
		this.queues = {};
		this.tournamentInfo = {};
		this.mergedArenas = new Map();
		this.queueDisplay = undefined;
		this.lastLoadTournamentInfoTimestamp = undefined;
		this.loadTournamentInfoNeeded = true;
	}

	getArenaName(arenaId) {
		var foundArena = undefined;

		Object.values(this.tournamentInfo).forEach(t => {
			if (foundArena === undefined) {
				foundArena = t.arenas.find((a) => a.arenaId == arenaId);
			}
		});

		return foundArena?.name ?? "Unknown arena - " + arenaId;
	}

	getQueueName(tournamentId) {
		var name = this.shortNames[tournamentId] || this.tournamentInfo[tournamentId].name;
  		if (name.trim() === "") {
			name = "\u00A0"; // &nbsp;
  		}
		return name;
	}

	getPlayer(tournamentId, playerId) {
		return this.tournamentInfo[tournamentId].players.find((p) => p.playerId == playerId);
	}

	async getPlayerName(tournamentId, playerId) {
		var player = this.getPlayer(tournamentId, playerId);
		if (player === undefined) {
			this.loadTournamentInfoNeeded = true;
			await this.loadTournamentInfoWithDebounce()
			player = this.getPlayer(tournamentId, playerId);
		}
		return player?.name ?? "Name unknown - " + playerId;
	}

	async buildSummaryPlayerName(playerInfo) {
		var playerName = await this.getPlayerName(playerInfo.tournamentId, playerInfo.playerId);
		var prefix = this.getQueueName(playerInfo.tournamentId).substring(0, 1);
		if (prefix?.trim() === "") {
			prefix = "";
		} else {
			prefix += " - ";
		}
		return prefix + playerName;
	}

	timeSinceToText(currentTime, pastTime) {
		const lessthan1Minute = "just joined";
		const lessthan2Minutes = "1 minute";
		const morethan2MinutesSuffix = " minutes";
		const morethan999Minutes = "forever";

		var past = Date.parse(pastTime);
		var differenceinMs = currentTime - past;

		var seconds = Math.floor(differenceinMs / 1000);
		var minutes = Math.floor(seconds / 60);

		if (minutes < 1) {
			return lessthan1Minute;
		} else if (minutes < 2) {
			return lessthan2Minutes;
		} else if (minutes > 999) {
			return morethan999Minutes;
		} else {
			return minutes + morethan2MinutesSuffix;
		}
	}

	buildLastUpdatedText(dataLoadTimestamp) {
		var hoursInt = dataLoadTimestamp.getHours()
		var timeSuffix;
		var hours;
		if (hoursInt === 0) {
			timeSuffix = "am";
			hours = "12";
		} else if (hoursInt < 12) {
			timeSuffix = "am"
			hours = String(hoursInt);
		} else if (hoursInt === 12) {
			timeSuffix = "pm"
			hours = "12";
		} else {
			timeSuffix = "pm";
			hours = String(hoursInt - 12);
		}
  		var minutes = String(dataLoadTimestamp.getMinutes()).padStart(2, '0');
  		var seconds = String(dataLoadTimestamp.getSeconds()).padStart(2, '0');
		var lastUpdatedText = `${hours}:${minutes}:${seconds} ${timeSuffix}`;
		return lastUpdatedText;
	}

	async displayQueuesSummary(currentTime) {
		var queueSummaryTitle = document.getElementById("queueSummaryTitle");
		var queueSummaryHeader = document.getElementById("queueSummaryHeader");
		var rowTemplate = document.getElementById("queueSummaryRowTemplate");

		if (this.queueSummaryDisplay !== undefined) {
			// Cleanup old elements
			this.queueSummaryDisplay.remove();
		}

		// Hold new elements outside of the DOM until they are ready to display
		this.queueSummaryDisplay = document.createElement("div");

		var arenaKeys = Array.from(this.mergedArenas.keys());
		var queueCount = arenaKeys.length;
		var queueKey = undefined;
		var queueItem = undefined;

		for (let i = 0; i < queueCount; i++) {
			var queueSummaryRow = rowTemplate.cloneNode(true);
			queueSummaryRow.id = 'summaryrow-' + i;
			queueSummaryRow.classList.remove("w3-hide");

			queueKey = arenaKeys[i];
			queueItem = this.queues[queueKey];

			var playerOne = queueItem?.[0];
			var playerTwo = queueItem?.[1];
			var playerThree = queueItem?.[2];
			var queueIsEmpty = (undefined === (playerOne ?? playerTwo ?? playerThree));

			var queueRowCols = queueSummaryRow.getElementsByTagName("div");
			queueRowCols[0].textContent = this.getArenaName(queueKey);
			if (queueIsEmpty) {
				queueRowCols[1].textContent = "Queue is empty";
			} else {
				queueRowCols[1].textContent = await this.buildSummaryPlayerName(playerOne);
			}
			if (playerTwo === undefined) {
				queueRowCols[2].textContent = "\u00A0"; // &nbsp;
			} else {
				queueRowCols[2].textContent = await this.buildSummaryPlayerName(playerTwo);
			}
			if (playerThree === undefined) {
				queueRowCols[3].textContent = "\u00A0"; // &nbsp;
			} else {
				queueRowCols[3].textContent = await this.buildSummaryPlayerName(playerThree);
			}

			if (i > 0) {
				Object.keys(queueRowCols).forEach(k => queueRowCols[k].classList.remove("w3-border-top"));
			}

			if (i % 2 === 1) {
				Object.keys(queueRowCols).forEach(k => queueRowCols[k].classList.add("w3-pale-green"));
			}

			this.queueSummaryDisplay.appendChild(queueSummaryRow);
		}

		queueSummaryTitle.classList.remove("w3-hide");
		queueSummaryHeader.classList.remove("w3-hide");
		// Add elements into the DOM
		rowTemplate.insertAdjacentElement("afterend", this.queueSummaryDisplay);

	}

	async displayFullQueues(currentTime) {
		var fullQueuesTitle = document.getElementById("fullQueuesTitle");
		var nameTemplate = document.getElementById("queueNameTemplate");
		var headerTemplate = document.getElementById("queueHeaderTemplate");
		var rowTemplate = document.getElementById("queueRowTemplate");

		if (this.queueDisplay !== undefined) {
			// Cleanup old elements
			this.queueDisplay.remove();
		}

		// Hold new elements outside of the DOM until they are ready to display
		this.queueDisplay = document.createElement("div");
		this.queueDisplay.classList.add("w3-flex");
		this.queueDisplay.classList.add("queue-list-flex");

		for (const [queueKey, queueItem] of Object.entries(this.queues)) {
			var queueFlexItem = document.createElement("div");
			queueFlexItem.classList.add("queue-flex");
			this.queueDisplay.appendChild(queueFlexItem);

			var queueName = nameTemplate.cloneNode(true);
			queueName.id = queueKey + '-name';
			queueName.classList.remove("w3-hide");
			queueName.getElementsByTagName("h3")[0].textContent = this.getArenaName(queueKey);
			queueFlexItem.appendChild(queueName);

			var queueHeader = headerTemplate.cloneNode(true);
			queueHeader.id = queueKey + '-header';
			queueHeader.classList.remove("w3-hide");
			queueFlexItem.appendChild(queueHeader);

			var isTopRow = true;
			for (const [playerIndex, queuedPlayer] of Object.entries(queueItem)) {
				var queueRow = rowTemplate.cloneNode(true);
				queueRow.id = queueItem.arenaId + "-" + playerIndex;
				queueRow.classList.remove("w3-hide");
				var queueRowCols = queueRow.getElementsByTagName("div");
				queueRowCols[0].textContent = parseInt(playerIndex) + 1;
				queueRowCols[1].textContent = await this.getPlayerName(queuedPlayer.tournamentId, queuedPlayer.playerId);
				queueRowCols[2].textContent = this.getQueueName(queuedPlayer.tournamentId);
				queueRowCols[3].textContent = this.timeSinceToText(currentTime, queuedPlayer.createdAt);
				if (!isTopRow) {
					Object.keys(queueRowCols).forEach(k => queueRowCols[k].classList.remove("w3-border-top"));
				}
				queueFlexItem.appendChild(queueRow);
				isTopRow = false;
			}
		}
		
		//fullQueuesTitle.classList.remove("w3-hide");
		// Add elements into the DOM
		rowTemplate.insertAdjacentElement("afterend", this.queueDisplay);
	}

	async displayQueues(dataLoadTimestamp) {
		console.log("Queues to display:");
		console.dir(this.queues);

		const currentTime = new Date();

		await this.displayQueuesSummary();
		await this.displayFullQueues(currentTime);

		if (dataLoadTimestamp instanceof Date) {
			var lastUpdatedText = this.buildLastUpdatedText(dataLoadTimestamp);
			var lastUpdated = document.getElementById("lastUpdated");
			lastUpdated.classList.remove("w3-hide");
			lastUpdated.textContent = "Last updated " + lastUpdatedText;
		}
	}

	compareByCreatedAt(a, b) {
		if (a.createdAt < b.createdAt) {
			return -1;
		}
		if (a.createdAt > b.createdAt) {
			return 1;
		}
		return 0;
	}

	getTournamentInfoUrl(tournamentId) {
		var url = new URL("https://app.matchplay.events/api/tournaments/" + tournamentId);
		url.searchParams.append("includePlayers", 1);
		url.searchParams.append("includeArenas", 1);
		return url;
	}

	getQueuesUrl(tournamentId) {
		return "https://app.matchplay.events/api/tournaments/" + tournamentId + "/queues";
	}

	makeRequest(url) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.setRequestHeader("Authorization", "Bearer " + this.matchPlayApiKey);

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr.responseText);
				} else {
					reject(new Error(`Request failed with status ${xhr.status}`));
				}
			};

			xhr.onerror = () => {
				reject(new Error('Network error'));
			};

			xhr.send();
		});
	}

	async loadTournamentInfoWithDebounce() {
		const debounceMilliseconds = 1000 * 60; // 60 seconds
		var skipLoad = true;

		if (this.loadTournamentInfoNeeded) {
			if (this.lastLoadTournamentInfoTimestamp === undefined) {
				skipLoad = false;
			} else {
				var timeSinceLastRefresh = (new Date() - this.lastLoadTournamentInfoTimestamp);
				if (timeSinceLastRefresh < debounceMilliseconds) {
					console.log(`Skipping tournament load request, last refresh was ${timeSinceLastRefresh} ms ago`);
				} else {
					console.log(`Loading tournament info after debounce of ${timeSinceLastRefresh} ms`);
					skipLoad = false;
				}
			}
		}

		if (!skipLoad) {
			await this.loadTournamentInfo();
		}
	}

	loadTournamentInfo() {
		const requests = this.tournamentIdList.map(tournamentId => this.makeRequest(this.getTournamentInfoUrl(tournamentId)));

		return Promise.all(requests)
        .then(results => {
            console.log('Load all tournament info requests succeeded:', results);
            // Process the results from all successful requests
			var jsonResults = results.map((r) => JSON.parse(r));

			// Clear previous tournament info
			this.tournamentInfo = {};
			this.mergedArenas.clear();

			jsonResults.forEach(response => {
				console.log("Load tournament info response:");
				console.dir(response);

				this.tournamentInfo[response.data.tournamentId] = response.data;

				response.data.arenas.forEach(arena => {
					if (!this.mergedArenas.has(arena.arenaId)) {
						this.mergedArenas.set(arena.arenaId, arena);
					}
				});
			});

			this.lastLoadTournamentInfoTimestamp = new Date();
			this.loadTournamentInfoNeeded = false;
        })
        .catch(error => {
            console.error('One or more load all queues requests failed:', error);
            // Handle the error from the first rejected request
        });
	}

	loadAllQueues() {
		const requests = this.tournamentIdList.map(tournamentId => this.makeRequest(this.getQueuesUrl(tournamentId)));

		return Promise.all(requests)
        .then(results => {
            console.log('Load all queues requests succeeded:', results);
            // Process the results from all successful requests
			var jsonResults = results.map((r) => JSON.parse(r));

			// Clear previous queues
			this.queues = {};

			jsonResults.forEach(response => {
				console.log("Load queue response:");
				console.dir(response);

				Object.keys(response.data).forEach(key => {
					if (this.queues[key] === undefined) {
						this.queues[key] = [];
					}
					this.queues[key].push(...response.data[key]);
				});
			});

			// Sort each queue by time the player joined the queue
			Object.keys(this.queues).forEach(k => {
				this.queues[k].sort(this.compareByCreatedAt);
			});
        })
        .catch(error => {
            console.error('One or more load all queues requests failed:', error);
            // Handle the error from the first rejected request
        });
	}
}

function cleanupApiKeyInput() {
	const bearerPrefix = "bearer ";
	const bearerPrefixLength = bearerPrefix.length
	var apiKeyElement = document.getElementById("matchPlayApiKey");
	var inputPrefix = apiKeyElement.value.substring(0, bearerPrefixLength);
	if (inputPrefix.toLowerCase() === bearerPrefix) {
		apiKeyElement.value = apiKeyElement.value.substring(bearerPrefix.length);
	}
}

function loadParameters() {
	cleanupApiKeyInput();
	var matchPlayApiKey = document.getElementById("matchPlayApiKey").value;
	var tournamentIdA = parseInt(document.getElementById("tournamentIdA").value);
	var tournamentShortNameA = document.getElementById("tournamentShortNameA").value;
	var tournamentIdB = parseInt(document.getElementById("tournamentIdB").value);
	var tournamentShortNameB = document.getElementById("tournamentShortNameB").value;

	QueuesManager.createOrUpdate(matchPlayApiKey, tournamentIdA, tournamentIdB);
	QueuesManager.manager.shortNames = {
		[tournamentIdA]: tournamentShortNameA,
		[tournamentIdB]: tournamentShortNameB
	};
}

async function loadQueuesButton() {
	var dataLoadTimestamp = new Date();

	loadParameters();

	await QueuesManager.manager.loadTournamentInfoWithDebounce();
	await QueuesManager.manager.loadAllQueues();
	await QueuesManager.manager.displayQueues(dataLoadTimestamp);
}

async function loadPlayersButton() {
	loadParameters();
	
	await QueuesManager.manager.loadTournamentInfo()
	await QueuesManager.manager.displayQueues();
}

async function autoLoadQueuesAndRepeat() {
	const delayTime = 1000 * 30; // 30 seconds

	if (QueuesManager.manager.autoLoadActive) {
		await loadQueuesButton();
		QueuesManager.manager.pendingAutoLoadTimeoutId = setTimeout(autoLoadQueuesAndRepeat, delayTime);
	}
}

async function startAutoLoadQueuesButton() {
	loadParameters();

	QueuesManager.manager.autoLoadActive = true;
	autoLoadQueuesAndRepeat();

	document.getElementById("startAutoLoadButton").classList.add("w3-hide");
	document.getElementById("stopAutoLoadButton").classList.remove("w3-hide");
}

function stopAutoLoadQueuesButton() {
	loadParameters();

	QueuesManager.manager.autoLoadActive = false;
	if (QueuesManager.manager.pendingAutoLoadTimeoutId !== undefined) {
		clearTimeout(QueuesManager.pendingAutoLoadTimeoutId);
		QueuesManager.manager.pendingAutoLoadTimeoutId = undefined;
	}

	document.getElementById("startAutoLoadButton").classList.remove("w3-hide");
	document.getElementById("stopAutoLoadButton").classList.add("w3-hide");
}

function initializeFromStorage() {
	const storageItemKey = "mergequeues";
	const itemValue = localStorage.getItem(storageItemKey);
	const item = JSON.parse(itemValue);
	if (item?.matchPlayApiKey !== undefined) {
		document.getElementById("matchPlayApiKey").value = item.matchPlayApiKey;
		loadParameters();
	}
}

function saveApiKey() {
	const storageItemKey = "mergequeues";
	loadParameters();
	const item = {
		matchPlayApiKey: QueuesManager.manager.matchPlayApiKey
	};

	localStorage.setItem(storageItemKey, JSON.stringify(item));
}

function clearSavedApiKey() {
	const storageItemKey = "mergequeues";
	localStorage.removeItem(storageItemKey);
}