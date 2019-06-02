var speed;

function onLoad() {
	window.addEventListener("push", function () {
		if (speed) document.getElementById("numberTxt").value = speed;
		Scan();
	});

	document.addEventListener("click", function (event) {
		var tag = event.target;
		var devId = tag.querySelector("#dev-id");
		var status = document.querySelector("#status");

		var openPort = function () {
			document.querySelector("#ble-close").disabled = false;
			document.querySelector("#ble-send").disabled = false;
			status.innerHTML = "Connected to: " + tag.firstChild.textContent;
			bluetoothSerial.subscribe("\n",
				function (data) {
					status.innerHTML = data;
				},
				errorHandle);
		};

		var onConfirm = function (buttonIndex) {
			if (buttonIndex == 1)
				bluetoothSerial.connect(devId.innerHTML, openPort, errorHandle);
		}

		if (devId) {
			navigator.notification.confirm(
				"Connect to device?",
				onConfirm,
				tag.firstChild.textContent,
				["Yes", "Cancel"]
			);
		}
	});

	document.addEventListener("touchstart", function (event) {
		var tag = event.target;
		console.log(tag);
		tag.querySelector("circle").getAttributeNode("fill").value = "red";
		if (tag.id == "M") {
			VoiceControl();
		}
		else if (tag.tagName == "svg")
			bluetoothSerial.write(tag.id + speed + "\n");
	});

	document.addEventListener("touchend", function (event) {
		var tag = event.target;
		tag.querySelector("circle").getAttributeNode("fill").value = "none";
		if (tag.id == "M") {
			SpeechRecognition.stopListening();
		}
		else if (tag.tagName == "svg")
			bluetoothSerial.write(tag.id + "0\n");
	});
}

var errorHandle = function (error) {
	var status = document.querySelector("#status");
	status.innerHTML = "Error: " + JSON.stringify(error);
}

function Scan() {
	var devices = document.querySelector("#devices");
	var status = document.querySelector("#status");
	devices.innerHTML = "";
	status.innerHTML = "Starting scan for devices...";

	var addDevice = function (results) {
		results.forEach(function (device) {
			devices.innerHTML += "<li class=\"table-view-cell\">\
			<a class=\"navigate-right\">" + device.name +
				"<p id=\"dev-id\">" + device.id + "</p>\
			</a></li>";
		});
	}

	var listPorts = function () {
		bluetoothSerial.list(addDevice, errorHandle);
	}

	var notEnabled = function () {
		status.innerHTML = "Bluetooth is not enabled.";
	}

	bluetoothSerial.isEnabled(listPorts, notEnabled);

	bluetoothSerial.isConnected(
		function () {
			document.querySelector("#ble-close").disabled = false;
			document.querySelector("#ble-send").disabled = false;
			status.innerHTML = "Bluetooth is connected.";
			bluetoothSerial.subscribe("\n",
				function (data) {
					status.innerHTML = data;
				},
				errorHandle);
		},
		function () {
			document.querySelector("#ble-close").disabled = true;
			document.querySelector("#ble-send").disabled = true;
			status.innerHTML = "Bluetooth is not connected.";
		}
	);
}

function Disconnect() {
	var status = document.querySelector("#status");

	var closePort = function () {
		document.querySelector("#ble-close").disabled = true;
		document.querySelector("#ble-send").disabled = true;
		status.innerHTML = "Attempting to disconnect.";
		bluetoothSerial.unsubscribe();
	};

	bluetoothSerial.disconnect(closePort, errorHandle);
}

function Send() {
	var message = document.getElementById("messageTxt").value;
	bluetoothSerial.write(message + "\n");
}

function SpeedSet() {
	speed = document.getElementById("numberTxt").value;
}

function VoiceControl() {
	var status = document.querySelector("#status");

	let options = {
		"language": "vi-VN",
		matches: 2,
		prompt: "Start voice",
		showPopup: true,
		showPartial: true
	}

	SpeechRecognition.isRecognitionAvailable()
		.then((available) => console.log(available));
	if (!speechRecognition.hasPermission()) {
		speechRecognition.requestPermission();
	}

	speechRecognition.startListening(
		function (result) {
			console.log(result);
			status.innerHTML = result;
		}, function (err) {
			console.error(err);
			status.innerHTML = err;
		}, options)
}