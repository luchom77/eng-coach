"""Source of the question bank. Edit or extend this file, then run:  python3 tools/build_bank.py

Each question: q(level, topic, subtopic, question, options, correct_index, explanation, check=None)
  - options: 4 strings in any order (the app shuffles them when it shows a question)
  - correct_index: position of the right option in `options` (0-3)
  - check: optional (python_expression, tolerance) used at build time to prove the arithmetic.
           The expression's value must match the number at the start of the correct option,
           and no other option may match it.
"""

QUESTIONS = []
_counters = {}
BATCH = "base"  # question files set this; only the "base" batch is bundled into the app


def q(level, topic, subtopic, question, options, correct_index, explanation, check=None):
    key = (level, topic)
    _counters[key] = _counters.get(key, 0) + 1
    qid = f"L{level}-{topic[0]}-{_counters[key]:02d}"
    QUESTIONS.append(
        dict(id=qid, level=level, topic=topic, subtopic=subtopic, question=question,
             options=options, correct_index=correct_index, explanation=explanation, check=check, batch=BATCH)
    )


M, E = "Mechanical", "Electrical"

# ============================ LEVEL 1 - MECHANICAL ============================
S = "SI units and unit conversion"
q(1, M, S, "Which of the following is the SI base unit of mass?",
  ["Gram", "Kilogram", "Newton", "Pound"], 1,
  "The kilogram is the SI base unit of mass. The gram is a thousandth of it, the newton is the unit "
  "of force, and the pound is an imperial unit, not part of the SI.")
q(1, M, S, "A shaft rotates at 1200 revolutions per minute (rpm). What is its angular speed in rad/s?",
  ["20 rad/s", "125.7 rad/s", "40 rad/s", "7540 rad/s"], 1,
  "One revolution is 2π radians and one minute is 60 s, so 1200 rpm = 1200 × 2π / 60 ≈ 125.7 rad/s. "
  "Forgetting the 2π gives 20, forgetting the π gives 40, and forgetting to divide by 60 gives 7540.",
  check=("1200*2*pi/60", 0.005))

S = "Mass, weight and density"
q(1, M, S, "An astronaut has a mass of 80 kg on Earth. What is her mass on the Moon, where gravity is about 1.6 m/s²?",
  ["13 kg", "128 kg", "80 kg", "8 kg"], 2,
  "Mass is the amount of matter in a body and does not change with location, so it is still 80 kg. "
  "Only her weight changes: W = m × g = 80 × 1.6 = 128 N on the Moon, which is not a mass.")
q(1, M, S, "A solid steel block has a volume of 0.002 m³. Steel has a density of 7800 kg/m³. What is the block's mass?",
  ["156 kg", "1.56 kg", "3 900 000 kg", "15.6 kg"], 3,
  "Mass = density × volume = 7800 × 0.002 = 15.6 kg. Dividing density by volume gives the nonsensical "
  "3 900 000, and a slipped decimal point gives 1.56 or 156.",
  check=("7800*0.002", 0.005))

S = "Force and Newton's laws"
q(1, M, S, "A net force of 20 N acts on a 4 kg object that starts at rest. What is its acceleration?",
  ["80 m/s²", "0.2 m/s²", "5 m/s²", "16 m/s²"], 2,
  "Newton's second law: F = m × a, so a = F / m = 20 / 4 = 5 m/s². Multiplying force by mass gives 80, "
  "and inverting the fraction gives 0.2.",
  check=("20/4", 0.005))
q(1, M, S, "A book rests on a table. According to Newton's third law, which statement is correct?",
  ["The book's weight and the table's upward push on the book are a third-law pair",
   "The table exerts no force on the book because the book is not moving",
   "The book pulls on the Earth with a force equal and opposite to the Earth's pull on the book",
   "The table's upward force must be larger than the book's weight for the book to stay up"], 2,
  "Third-law forces act on two different bodies, are equal in size and opposite in direction. The "
  "Earth pulls the book down (its weight) and the book pulls the Earth up with the same force. The "
  "table's push and the weight both act on the book; they cancel because the book is in equilibrium, "
  "not because of the third law.")

S = "Speed, velocity and acceleration"
q(1, M, S, "A car travels 150 km in 2.5 hours at constant speed. What is its speed in m/s?",
  ["60 m/s", "216 m/s", "6 m/s", "16.7 m/s"], 3,
  "Speed = 150 km / 2.5 h = 60 km/h. To convert to m/s divide by 3.6, giving about 16.7 m/s. "
  "Leaving it as 60 forgets the conversion, and multiplying by 3.6 converts in the wrong direction.",
  check=("150/2.5/3.6", 0.005))
q(1, M, S, "A bicycle speeds up from rest to 12 m/s in 8 s with constant acceleration. What is the acceleration?",
  ["1.5 m/s²", "96 m/s²", "0.67 m/s²", "4 m/s²"], 0,
  "Acceleration = change in speed / time = 12 / 8 = 1.5 m/s². Multiplying the numbers gives 96, "
  "and inverting the fraction gives 0.67.",
  check=("12/8", 0.005))

S = "Work, energy and power"
q(1, M, S, "A 50 N force pushes a crate 6 m along the floor, in the direction of the force. How much work is done?",
  ["8.3 J", "56 J", "300 W", "300 J"], 3,
  "Work = force × distance in the direction of the force = 50 × 6 = 300 J. Watts measure power "
  "(energy per second), not work, so 300 W is the wrong unit.",
  check=("50*6", 0.005))
q(1, M, S, "A motor lifts a 100 kg load 5 m at constant speed in 10 s. Taking g = 9.81 m/s², what is the useful power output?",
  ["491 W", "49 W", "4905 W", "5 W"], 0,
  "The work done is m × g × h = 100 × 9.81 × 5 = 4905 J. Power is work divided by time: "
  "4905 / 10 ≈ 491 W. Quoting 4905 forgets to divide by the time.",
  check=("100*9.81*5/10", 0.005))

S = "Simple machines (levers, pulleys, inclined planes)"
q(1, M, S, "A lever has an effort arm of 1.2 m and a load arm of 0.3 m. What is its ideal mechanical advantage?",
  ["0.25", "1.5", "0.36", "4"], 3,
  "The ideal mechanical advantage of a lever is effort arm / load arm = 1.2 / 0.3 = 4, so a small "
  "effort can balance a load four times larger. Inverting the ratio gives 0.25, and multiplying the "
  "arms gives 0.36.",
  check=("1.2/0.3", 0.005))
q(1, M, S, "A frictionless ramp 4 m long raises a load to a height of 1 m. What is the ideal mechanical advantage of the ramp?",
  ["0.25", "4", "1", "5"], 1,
  "For an inclined plane, ideal mechanical advantage = ramp length / height = 4 / 1 = 4. The load can "
  "be raised with a quarter of the force, over four times the distance. The work done is the same.",
  check=("4/1", 0.005))

S = "Pressure and basic fluid statics"
q(1, M, S, "A force of 600 N acts evenly over an area of 0.03 m². What is the pressure?",
  ["18 Pa", "200 Pa", "2 kPa", "20 kPa"], 3,
  "Pressure = force / area = 600 / 0.03 = 20 000 Pa = 20 kPa. Multiplying instead of dividing gives "
  "18 Pa, and a slipped decimal gives 200 Pa or 2 kPa.",
  check=("600/0.03/1000", 0.005))
q(1, M, S, "What is the gauge pressure at a depth of 10 m in fresh water? (ρ = 1000 kg/m³, g = 9.81 m/s²)",
  ["9.8 kPa", "199 kPa", "98 kPa", "981 kPa"], 2,
  "Gauge pressure from a liquid column is ρ × g × h = 1000 × 9.81 × 10 = 98 100 Pa ≈ 98 kPa. Adding "
  "atmospheric pressure (about 101 kPa) would give the absolute pressure of about 199 kPa, which is "
  "a different quantity.",
  check=("1000*9.81*10/1000", 0.005))

S = "Temperature and heat basics"
q(1, M, S, "Convert a temperature of 300 K to degrees Celsius.",
  ["573 °C", "26.9 °C", "-26.9 °C", "300 °C"], 1,
  "Celsius = kelvin − 273.15, so 300 K = 26.85 °C, about 26.9 °C. Adding 273 instead of subtracting "
  "gives 573 °C.",
  check=("300-273.15", 0.005))
q(1, M, S, "How much heat is needed to raise the temperature of 2 kg of water by 10 °C? (specific heat of water c = 4200 J/(kg·°C))",
  ["8.4 kJ", "42 kJ", "84 kJ", "840 kJ"], 2,
  "Q = m × c × ΔT = 2 × 4200 × 10 = 84 000 J = 84 kJ. Each of the three factors matters: dropping the "
  "mass gives 42 kJ, and a slipped decimal gives 8.4 kJ or 840 kJ.",
  check=("2*4200*10/1000", 0.005))

# ============================ LEVEL 1 - ELECTRICAL ============================
S = "Voltage, current and resistance"
q(1, E, S, "Which unit is used to measure electrical current?",
  ["Volt", "Ampere", "Ohm", "Watt"], 1,
  "Current is measured in amperes (A). The volt measures voltage, the ohm measures resistance, "
  "and the watt measures power.")
q(1, E, S, "A charge of 12 coulombs passes a point in a wire in 4 seconds. What is the current?",
  ["48 A", "0.33 A", "3 A", "8 A"], 2,
  "Current is charge per unit time: I = Q / t = 12 / 4 = 3 A (one ampere is one coulomb per second). "
  "Multiplying gives 48 and inverting the fraction gives 0.33.",
  check=("12/4", 0.005))

S = "Ohm's law"
q(1, E, S, "A 12 V battery is connected across an 8 Ω resistor. What current flows?",
  ["96 A", "0.67 A", "4 A", "1.5 A"], 3,
  "Ohm's law: I = V / R = 12 / 8 = 1.5 A. Multiplying the numbers gives 96, and inverting the "
  "fraction gives 0.67.",
  check=("12/8", 0.005))
q(1, E, S, "A resistor carries 0.5 A when the voltage across it is 20 V. What is its resistance?",
  ["10 Ω", "40 Ω", "0.025 Ω", "20.5 Ω"], 1,
  "Ohm's law: R = V / I = 20 / 0.5 = 40 Ω. Multiplying the two numbers gives 10 Ω, and inverting "
  "the fraction gives 0.025 Ω.",
  check=("20/0.5", 0.005))

S = "Electrical power and energy (P = VI)"
q(1, E, S, "A 230 V appliance draws a current of 5 A. How much power does it consume?",
  ["46 W", "235 W", "1150 W", "1.15 W"], 2,
  "Electrical power P = V × I = 230 × 5 = 1150 W. Dividing the numbers gives 46 W, and adding them "
  "gives 235 W.",
  check=("230*5", 0.005))
q(1, E, S, "A 2 kW heater runs for 3 hours. How much energy does it use?",
  ["0.67 kWh", "5 kWh", "6 kW", "6 kWh"], 3,
  "Energy = power × time = 2 kW × 3 h = 6 kWh. A kilowatt is a unit of power, not energy, so "
  "'6 kW' has the wrong unit.",
  check=("2*3", 0.005))

S = "Series and parallel resistors"
q(1, E, S, "Resistors of 10 Ω, 20 Ω and 30 Ω are connected in series. What is the total resistance?",
  ["5.45 Ω", "20 Ω", "60 Ω", "6000 Ω"], 2,
  "In a series circuit the resistances simply add: 10 + 20 + 30 = 60 Ω. The 5.45 Ω answer is what "
  "you would get if they were in parallel, and 20 Ω is just their average.",
  check=("10+20+30", 0.005))
q(1, E, S, "Two 12 Ω resistors are connected in parallel. What is the equivalent resistance?",
  ["24 Ω", "12 Ω", "6 Ω", "3 Ω"], 2,
  "For two equal resistors in parallel, the equivalent resistance is half of one: 12 / 2 = 6 Ω. "
  "In general 1/R = 1/12 + 1/12 = 2/12. Parallel paths always lower the resistance below the "
  "smallest single resistor, so 24 Ω (the series total) cannot be right.",
  check=("12*12/(12+12)", 0.005))

S = "DC versus AC basics"
q(1, E, S, "Which statement correctly describes alternating current (AC)?",
  ["The current flows in one direction at a constant value",
   "The current periodically reverses its direction",
   "The current flows only through insulators",
   "The current has no voltage"], 1,
  "In alternating current the flow of charge repeatedly reverses direction, usually following a sine "
  "wave. Direct current (DC) flows in one direction. Mains electricity is AC.")
q(1, E, S, "Mains electricity in Spain has a frequency of 50 Hz. How many complete cycles does the current make each second?",
  ["25", "50", "100", "230"], 1,
  "Frequency is the number of complete cycles per second, so 50 Hz means 50 cycles each second. "
  "Within each cycle the current reverses direction twice, so it changes direction 100 times per "
  "second, but that is not the number of cycles. 230 V is the voltage, not the frequency.")

S = "Conductors, insulators and wire basics"
q(1, E, S, "Which of these materials is a good electrical insulator?",
  ["Copper", "Aluminium", "Silver", "Rubber"], 3,
  "Rubber has very few free charges, so it blocks current and is used to coat wires and handles. "
  "Copper, aluminium and silver are all metals and good conductors.")
q(1, E, S, "The cross-sectional area of a copper wire is doubled while its length stays the same. What happens to its resistance?",
  ["It doubles", "It is halved", "It stays the same", "It quadruples"], 1,
  "Resistance is R = ρ × L / A, so it is inversely proportional to the cross-sectional area. Doubling "
  "the area gives the current twice as much room to flow, which halves the resistance.")

S = "Electrical safety, fuses and breakers"
q(1, E, S, "What is the main purpose of a fuse in a circuit?",
  ["To increase the voltage", "To store electrical energy",
   "To melt and break the circuit when the current is too high",
   "To reduce the power consumption of the load"], 2,
  "A fuse contains a thin wire that heats up and melts if the current exceeds its rating, "
  "interrupting the circuit before the wiring overheats. Circuit breakers do the same job and can be "
  "reset.")
q(1, E, S, "To choose a suitable fuse you first need the appliance's normal current. A 2300 W appliance runs on 230 V. What is that current?",
  ["0.1 A", "23 A", "10 A", "100 A"], 2,
  "I = P / V = 2300 / 230 = 10 A. The fuse or breaker is then chosen with a rating somewhat above "
  "10 A, but below the current the wiring can safely carry. Inverting the fraction gives 0.1 A.",
  check=("2300/230", 0.005))

S = "Basic components (resistor, capacitor, inductor, diode)"
q(1, E, S, "Which component stores energy in an electric field between two plates?",
  ["Resistor", "Capacitor", "Inductor", "Diode"], 1,
  "A capacitor stores energy in the electric field between its two plates. An inductor stores energy "
  "in a magnetic field, a resistor dissipates energy as heat, and a diode controls the direction of "
  "current.")
q(1, E, S, "Which component allows current to flow in essentially only one direction?",
  ["Diode", "Resistor", "Capacitor", "Inductor"], 0,
  "A diode conducts when it is forward-biased and blocks current in the reverse direction. This is "
  "why diodes are used in rectifiers that turn AC into DC.")


# More question files register themselves by calling q() when imported.
import bank_fundamentals_2  # noqa: E402,F401
