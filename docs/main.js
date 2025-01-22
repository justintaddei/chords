fetch("./descriptions.json")
	.then((res) => res.json())
	.then((descriptions) => {
		const chords = document.querySelector(".chords");

		for (const mode of ["normal", "visual", "leader"]) {
			const modeLi = document.createElement("li");
			const h2 = document.createElement("h2");
			const ul = document.createElement("ul");

			h2.textContent = mode;
			modeLi.classList.add(mode);

			modeLi.appendChild(h2);
			modeLi.appendChild(ul);

			chords.appendChild(modeLi);
		}

		for (const mode of ["normal", "visual", "leader"]) {
			const modeUl = chords.querySelector(`.${mode}`);

			for (const [chord, actions] of Object.entries(descriptions[mode])) {
				const motionLi = document.createElement("li");
				const h3 = document.createElement("h3");
				const ol = document.createElement("ol");

				if (/^<\w+>$/.test(chord)) {
					const kbd = document.createElement("kbd");
					kbd.textContent = chord.slice(1, -1);
					kbd.classList.add("special");
					h3.appendChild(kbd);
				} else {
					for (const char of chord) {
						const kbd = document.createElement("kbd");
						kbd.textContent = char;
						h3.appendChild(kbd);
					}
				}

				motionLi.appendChild(h3);
				motionLi.appendChild(ol);

				motionLi.addEventListener("click", (e) => {
					console.log("e :>>", e);
					e.currentTarget.classList.toggle("open");
				});

				motionLi.classList.add("motion");
				motionLi.dataset.chord = chord;

				if (actions.length === 1) motionLi.classList.add("single");
				if (actions.length > 1) {
					const count = document.createElement("span");
					count.textContent = `${actions.length} actions`;
					count.classList.add("count");
					h3.appendChild(count);
				}

				for (const action of actions) {
					const actionLi = document.createElement("li");
					const p = document.createElement("p");
					const span = document.createElement("span");

					span.textContent = action;

					p.appendChild(span);
					actionLi.appendChild(p);
					ol.appendChild(actionLi);
				}

				modeUl.appendChild(motionLi);
			}
		}
	});

const filter = document.getElementById("filter");

filter.addEventListener("input", (e) => {
	const input = e.target.value;

	const chords = document.querySelectorAll(".motion");

	for (const chord of chords) {
		if (input) {
			if (chord.dataset.chord.startsWith(input)) {
				chord.classList.remove("hidden");
			} else {
				chord.classList.add("hidden");
			}
		} else {
			chord.classList.remove("hidden");
		}
	}

	const visibleChords = [...chords].filter(
		(chord) => !chord.classList.contains("hidden"),
	);

	if (visibleChords.length < 3) {
		for (const chord of chords) {
			chord.classList.add("open");
		}
	} else {
		for (const chord of visibleChords) {
			chord.classList.remove("open");
		}
	}
});
