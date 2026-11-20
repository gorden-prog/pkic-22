(function () {
	'use strict';

	const output = document.getElementById('output');
	const AUTH_KEY = 'auth';

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function parseCredentials(raw) {
		if (!raw) {
			return null;
		}

		try {
			const data = JSON.parse(raw);

			if (data && data.key === AUTH_KEY &&
				typeof data.login === 'string' && typeof data.password === 'string') {
				return { login: data.login, password: data.password };
			}
		} catch (error) {
			console.error('Не удалось разобрать данные авторизации:', error.message);
		}

		return null;
	}

	function readCredentials() {
		const fromWindowName = parseCredentials(window.name);

		if (fromWindowName) {
			return fromWindowName;
		}

		try {
			return parseCredentials(sessionStorage.getItem(AUTH_KEY));
		} catch (error) {
			return null;
		}
	}

	function findUser(credentials) {
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			const auth = user.authorization;

			if (auth.login === credentials.login && auth.password === credentials.password) {
				return { user: user, index: i };
			}
		}

		return null;
	}

	function renderError(title, message) {
		output.innerHTML =
			'<section class="card error-card">' +
				'<h2>Ошибка аутентификации пользователя</h2>' +
				'<p class="service-message">Служебное сообщение: ' + escapeHtml(message) + '</p>' +
				'<p class="card-text">' + escapeHtml(title) + '</p>' +
				'<a class="link" href="index.html" data-logout>Вернуться к авторизации</a>' +
			'</section>';
	}

	function pluralYears(value) {
		const whole = Math.trunc(Math.abs(value));
		const mod10 = whole % 10;
		const mod100 = whole % 100;

		if (mod10 === 1 && mod100 !== 11) {
			return 'год';
		}

		if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
			return 'года';
		}

		return 'лет';
	}

	function formatExperience(value) {
		const number = Number(value);

		if (!Number.isFinite(number)) {
			return '—';
		}

		const text = String(number).replace('.', ',');

		const whole = Math.trunc(number);
		let word = pluralYears(whole);

		if (!Number.isInteger(number) && word === 'год') {
			word = 'года';
		}

		return text + ' ' + word;
	}

	function renderProfile(user, position) {
		const info = user.info;
		const fullName = info.surname + ' ' + info.name + ' ' + info.patronymic;

		const rows = [
			['Должность', info.post],
			['Категория', info.category],
			['Уровень образования', info.level_edu],
			['Опыт работы в колледже', formatExperience(info.experience_college)],
			['Общий опыт работы', formatExperience(info.experience_total)],
			['Email', info.email]
		];

		const rowsHtml = rows.map(function (row) {
			const label = row[0];
			const value = row[1];
			const isEmail = label === 'Email';

			const valueHtml = isEmail
				? '<a href="mailto:' + escapeHtml(value) + '">' + escapeHtml(value) + '</a>'
				: escapeHtml(value);

			return '<div class="field">' +
				'<dt>' + escapeHtml(label) + '</dt>' +
				'<dd>' + valueHtml + '</dd>' +
			'</div>';
		}).join('');

		output.innerHTML =
			'<section class="card profile-card">' +
				'<div class="profile-head">' +
					'<h2>' + escapeHtml(fullName) + '</h2>' +
				'</div>' +
				'<dl class="fields">' + rowsHtml + '</dl>' +
				'<div class="profile-actions">' +
					'<a class="link link--ghost" href="index.html" data-logout>Выйти</a>' +
				'</div>' +
			'</section>';

		console.info('Пользователь найден: ' + fullName + ' (индекс в массиве: ' + position + ')');
		console.info('Данные профиля:', info);
	}

	output.addEventListener('click', function (event) {
		if (event.target.closest('[data-logout]')) {
			window.name = '';

			try {
				sessionStorage.removeItem(AUTH_KEY);
			} catch (error) {

			}
		}
	});

	function init() {
		const credentials = readCredentials();

		if (!credentials) {
			console.warn('Нет данных авторизации, возвращаем на index.html');
			location.replace('index.html');
			return;
		}

		const found = findUser(credentials);

		if (!found) {
			renderError(
				'Проверьте раскладку клавиатуры и регистр символов.',
				'Error. Неверный логин и/или пароль'
			);
			console.error('Ошибка аутентификации пользователя');
			console.error('Error. Неверный логин и/или пароль');
			return;
		}

		renderProfile(found.user, found.index);
	}

	init();
})();
