(function () {
	'use strict';

	const statusBox = document.getElementById('status');
	const retryButton = document.getElementById('retry');

	function fail(message) {
		statusBox.textContent = message;
		statusBox.hidden = false;
		retryButton.hidden = false;
	}

	function authorize() {
		statusBox.hidden = true;
		retryButton.hidden = true;

		const login = prompt('Логин:');

		if (login === null) {
			fail('Вход отменён.');
			return;
		}

		const password = prompt('Пароль:');

		if (password === null) {
			fail('Вход отменён.');
			return;
		}

		if (!login.trim() || !password.trim()) {
			fail('Логин и пароль не могут быть пустыми.');
			return;
		}

		window.name = JSON.stringify({
			key: 'auth',
			login: login.trim(),
			password: password.trim()
		});

		try {
			sessionStorage.setItem('auth', window.name);
		} catch (error) {

		}

		location.href = 'profile.html';
	}

	function startWhenPageReady() {
		requestAnimationFrame(function () {
			requestAnimationFrame(function () {
				setTimeout(authorize, 200);
			});
		});
	}

	window.addEventListener('load', startWhenPageReady, { once: true });
	retryButton.addEventListener('click', authorize);
})();
