const readline = require('readline');
const r_interface = readline.createInterface({ input: process.stdin, output: process.stdout });

class AmountError extends TypeError {
	constructor(message) {
		super(message);
		this.name = '⛔ AMOUNT ERROR';
		this.code = 400;
	}
}

class Terminal {
	static input(prompt) {
		return new Promise((resolve) => {
			r_interface.question(prompt, (input) => {
				resolve(input);
			});
		});
	}

	static output(output) {
		console.log(output);
	}

	static clear() {
		process.stdout.write('\x1b[2J\x1b[H');
	}

	static end() {
		r_interface.close();
		process.exit(0);
	}
}

class Validation {
	static amountValidation(amount) {
		try {
			if (isNaN(amount)) {
				throw new AmountError(`Amount value is invalid`);
			} else if (!isNaN(amount) && amount < 0) {
				throw new AmountError('Amount value cannot be negative');
			} else {
				return amount;
			}
		} catch (error) {
			Terminal.clear();
			Terminal.output('\n\n====== something went wrong! ======');
			Terminal.output(`${error.name}: ${error.message}\n`);
			return null;
		}
	}
}

class BankingSystem {
	constructor(saldo) {
		this.saldo = saldo;
		this.transactionLog = [];
		this.log('✔ Account created', saldo);
	}

	log(action, amount) {
		const timestamp = `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
		const logEntry = `${timestamp}: ${action}: Rp. ${amount} \t Balance: Rp. ${this.saldo}`;
		this.transactionLog.push(logEntry);
	}

	async deposit(amount) {
		if (amount === null) return; // so as not to return any value if validation fails on the Validation.amountValidation

		return new Promise((resolve, reject) => {
			Terminal.clear();
			console.log('Loading...');

			setTimeout(() => {
				this.saldo += amount;
				this.log('➕ Deposit', amount);

				Terminal.clear();
				Terminal.output(`✔ Deposit successful! New balance: Rp. ${this.saldo}`);

				setTimeout(() => {
					resolve(Terminal.clear());
				}, 2000);
			}, 2000);
		});
	}

	async withdraw(amount) {
		if (amount === null) return;

		return new Promise((resolve, reject) => {
			Terminal.clear();
			console.log('Loading...');

			setTimeout(() => {
				if (amount > this.saldo) {
					this.log('⛔ Insufficient funds Withdraw attempt', amount);

					Terminal.clear();
					Terminal.output('⛔ Your remaining balance is insufficient!');

					setTimeout(() => {
						resolve(Terminal.clear()); // Resolve to continue the program even on insufficient funds and keep data from being lost
					}, 2000);
				} else {
					this.saldo -= amount;
					this.log('➖ Withdraw', amount);

					Terminal.clear();
					Terminal.output(`✔ Withdraw successful! New Balance: Rp. ${this.saldo}`);

					setTimeout(() => {
						resolve(Terminal.clear());
					}, 2000);
				}
			}, 2000);
		});
	}

	async showLog() {
		this.printTransactionHistory();
	}

	printTransactionHistory() {
		Terminal.clear();
		Terminal.output('========== Log Transaction =========');
		Terminal.output(this.transactionLog.join('\n'));
	}
}

module.exports = {
	Terminal,
	BankingSystem,
	Validation,
};
