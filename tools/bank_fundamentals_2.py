"""Level 1 (Fundamentals), second batch: 50 Mechanical + 50 Electrical questions.

Export for the phone:  python3 tools/build_bank.py --json fundamentals-100.json --batch fundamentals-2
"""
import bank_src as b

b.BATCH = "fundamentals-2"
q, M, E = b.q, b.M, b.E

# ====================================================================================
# MECHANICAL (50)
# ====================================================================================
S = "SI units and unit conversion"
q(1, M, S, "How many millimetres are there in 2.5 metres?",
  ["25 mm", "250 mm", "2500 mm", "0.0025 mm"], 2,
  "One metre is 1000 millimetres, so multiply by 1000: 2.5 × 1000 = 2500 mm. Multiplying by 10 or 100 "
  "mixes millimetres up with decimetres or centimetres.",
  check=("2.5*1000", 0.005))
q(1, M, S, "Convert a speed of 72 km/h to metres per second.",
  ["259 m/s", "20 m/s", "7.2 m/s", "1.2 m/s"], 1,
  "There are 1000 m in a km and 3600 s in an hour, so divide km/h by 3.6: 72 / 3.6 = 20 m/s. "
  "Multiplying by 3.6 converts in the wrong direction and gives 259.",
  check=("72/3.6", 0.005))
q(1, M, S, "Which of these is NOT an SI base unit?",
  ["Metre", "Second", "Newton", "Kelvin"], 2,
  "The SI base units are the metre, kilogram, second, ampere, kelvin, mole and candela. The newton is a "
  "derived unit: 1 N = 1 kg·m/s².")
q(1, M, S, "A tank holds 3 litres of water. What is that volume in cubic metres?",
  ["0.003 m³", "0.03 m³", "3 m³", "3000 m³"], 0,
  "One litre is 0.001 m³ (a cubic metre holds 1000 litres), so 3 litres = 0.003 m³.",
  check=("3*0.001", 0.005))
q(1, M, S, "What is one newton equal to, in SI base units?",
  ["1 kg·m/s", "1 kg·m²/s²", "1 kg·m/s²", "1 kg/(m·s²)"], 2,
  "Newton's second law gives force = mass × acceleration, so 1 N = 1 kg × 1 m/s² = 1 kg·m/s². With an "
  "extra metre (kg·m²/s²) you get the joule, the unit of energy.")
q(1, M, S, "A gear turns at 3000 revolutions per minute. How many revolutions is that per second?",
  ["180 000 rev/s", "50 rev/s", "5 rev/s", "0.02 rev/s"], 1,
  "A minute has 60 seconds, so divide by 60: 3000 / 60 = 50 revolutions per second. Multiplying by 60 "
  "goes the wrong way, and 0.02 is the time for one revolution in seconds.",
  check=("3000/60", 0.005))
q(1, M, S, "The prefix 'mega' (M), as in megapascal, means:",
  ["10³", "10⁹", "10⁻⁶", "10⁶"], 3,
  "Mega means one million, 10⁶. Kilo is 10³, giga is 10⁹ and micro is 10⁻⁶.")

S = "Mass, weight and density"
q(1, M, S, "What is the weight of a 5 kg object on Earth? (g = 9.81 m/s²)",
  ["0.51 N", "5 N", "49 N", "49 kg"], 2,
  "Weight is a force: W = m × g = 5 × 9.81 ≈ 49 N. Dividing by g gives 0.51, and kilograms measure mass, "
  "not weight.",
  check=("5*9.81", 0.005))
q(1, M, S, "Water has a density of 1000 kg/m³. What is the mass of 0.5 m³ of water?",
  ["2000 kg", "500 kg", "0.0005 kg", "1000.5 kg"], 1,
  "Mass = density × volume = 1000 × 0.5 = 500 kg. Dividing density by volume gives 2000, which is not a mass.",
  check=("1000*0.5", 0.005))
q(1, M, S, "A metal block has a mass of 2 kg and a volume of 0.00025 m³. What is its density?",
  ["0.0005 kg/m³", "500 kg/m³", "8000 kg/m³", "80 000 kg/m³"], 2,
  "Density = mass / volume = 2 / 0.00025 = 8000 kg/m³, typical of steel. Multiplying mass by volume gives 0.0005.",
  check=("2/0.00025", 0.005))
q(1, M, S, "An aluminium block (2700 kg/m³) and a steel block (7800 kg/m³) have exactly the same volume. Which statement is true?",
  ["The aluminium block has more mass", "The steel block has more mass",
   "Both blocks have the same mass", "The steel block has less volume"], 1,
  "Mass = density × volume. With equal volumes, the material with the higher density has the greater mass, "
  "so the steel block is heavier than the aluminium block.")
q(1, M, S, "An object weighs 600 N on Earth. Taking g = 9.81 m/s², what is its mass?",
  ["5886 kg", "61.2 kg", "600 kg", "0.016 kg"], 1,
  "Weight W = m × g, so m = W / g = 600 / 9.81 ≈ 61.2 kg. Multiplying by g gives 5886, which is not a mass.",
  check=("600/9.81", 0.005))
q(1, M, S, "What happens to an object's mass and weight when it is taken from Earth to the Moon?",
  ["Mass and weight both stay the same", "Mass stays the same and weight decreases",
   "Mass decreases and weight stays the same", "Mass and weight both decrease"], 1,
  "Mass is the amount of matter and does not depend on location. Weight is the gravitational force on that "
  "mass, and the Moon's gravity is about one sixth of Earth's, so the weight decreases.")
q(1, M, S, "A steel plate measures 2 m × 0.5 m × 0.01 m. Steel has a density of 7800 kg/m³. What is its mass?",
  ["7.8 kg", "780 kg", "78 kg", "15 600 kg"], 2,
  "The volume is 2 × 0.5 × 0.01 = 0.01 m³. Mass = density × volume = 7800 × 0.01 = 78 kg. A slipped decimal "
  "point gives 7.8 or 780.",
  check=("2*0.5*0.01*7800", 0.005))

S = "Force and Newton's laws"
q(1, M, S, "A 10 kg box is pushed by a net force of 30 N. What is its acceleration?",
  ["300 m/s²", "0.33 m/s²", "3 m/s²", "20 m/s²"], 2,
  "F = m × a, so a = F / m = 30 / 10 = 3 m/s². Multiplying the numbers gives 300, and inverting the fraction "
  "gives 0.33.",
  check=("30/10", 0.005))
q(1, M, S, "What net force is needed to accelerate a 1200 kg car at 2.5 m/s²?",
  ["480 N", "3000 N", "1202.5 N", "300 N"], 1,
  "F = m × a = 1200 × 2.5 = 3000 N. Dividing the mass by the acceleration gives 480, which is not a force.",
  check=("1200*2.5", 0.005))
q(1, M, S, "Newton's first law says an object at rest, or moving at constant velocity in a straight line, stays that way unless:",
  ["its mass changes", "a net external force acts on it", "it is heated", "it is placed in a vacuum"], 1,
  "Only a net external force changes an object's velocity; the tendency to keep its motion is called inertia. "
  "Without such a force the motion stays the same, whether in air or in a vacuum.")
q(1, M, S, "Two forces act on a point: 6 N to the east and 8 N to the north. What is the size of the resultant force?",
  ["14 N", "2 N", "10 N", "48 N"], 2,
  "Perpendicular forces combine with Pythagoras: the square root of (6² + 8²) = the square root of 100 = 10 N. "
  "Simply adding them (14 N) only works for forces in the same direction.",
  check=("(6**2+8**2)**0.5", 0.005))
q(1, M, S, "A 70 kg person stands on a bathroom scale in a lift moving up at constant speed. What force does the scale read? (g = 9.81 m/s²)",
  ["70 N", "687 N", "6.9 N", "0 N"], 1,
  "At constant speed the acceleration is zero, so the net force is zero and the scale supports the full "
  "weight: 70 × 9.81 ≈ 687 N. The reading only changes while the lift is accelerating.",
  check=("70*9.81", 0.005))
q(1, M, S, "A 1000 kg car brakes with a constant force of 4000 N. What is the size of its deceleration?",
  ["0.25 m/s²", "4 m/s²", "4 000 000 m/s²", "40 m/s²"], 1,
  "a = F / m = 4000 / 1000 = 4 m/s², directed opposite to the motion. Multiplying instead of dividing gives "
  "4 000 000, and inverting the fraction gives 0.25.",
  check=("4000/1000", 0.005))

S = "Speed, velocity and acceleration"
q(1, M, S, "What is the difference between speed and velocity?",
  ["They are identical quantities", "Velocity includes direction, speed does not",
   "Speed includes direction, velocity does not", "Speed is measured in m/s² and velocity in m/s"], 1,
  "Speed is a scalar: it has a size only. Velocity is a vector: it has a size and a direction. A car going round "
  "a roundabout at constant speed has a changing velocity.")
q(1, M, S, "A runner covers 400 m in 50 s. What is the average speed?",
  ["8 m/s", "0.125 m/s", "20 000 m/s", "350 m/s"], 0,
  "Average speed = distance / time = 400 / 50 = 8 m/s. Inverting the fraction gives 0.125, and multiplying gives 20 000.",
  check=("400/50", 0.005))
q(1, M, S, "A train moving at 20 m/s accelerates uniformly at 0.5 m/s² for 10 s. What is its final speed?",
  ["5 m/s", "25 m/s", "30 m/s", "200 m/s"], 1,
  "Use v = u + a × t = 20 + 0.5 × 10 = 25 m/s. The first option is only the speed gained, forgetting the starting speed.",
  check=("20+0.5*10", 0.005))
q(1, M, S, "An object is dropped from rest. Ignoring air resistance (g = 9.81 m/s²), what is its speed after 3 s?",
  ["3.27 m/s", "29.4 m/s", "44.1 m/s", "88.3 m/s"], 1,
  "Starting from rest, v = g × t = 9.81 × 3 ≈ 29.4 m/s. The value 44.1 is the distance fallen in metres "
  "(½ g t²), not a speed.",
  check=("9.81*3", 0.005))
q(1, M, S, "A car accelerates from 0 to 100 km/h in 8 s. What is its average acceleration in m/s²?",
  ["12.5 m/s²", "3.47 m/s²", "0.29 m/s²", "27.8 m/s²"], 1,
  "First convert 100 km/h to m/s: 100 / 3.6 ≈ 27.8 m/s. Then a = change in speed / time = 27.8 / 8 ≈ 3.47 m/s². "
  "Skipping the conversion gives 12.5, and 27.8 forgets to divide by the time.",
  check=("100/3.6/8", 0.005))
q(1, M, S, "An object travels 60 m in the first 5 s and 90 m in the next 5 s. What is its average speed over the whole 10 s?",
  ["12 m/s", "18 m/s", "15 m/s", "150 m/s"], 2,
  "Average speed = total distance / total time = (60 + 90) / 10 = 15 m/s. The first two options are the speeds "
  "during each separate 5 s interval.",
  check=("(60+90)/10", 0.005))
q(1, M, S, "What does the area under a velocity-time graph represent?",
  ["The acceleration", "The displacement", "The force", "The power"], 1,
  "Displacement = velocity × time, which is the area under a velocity-time graph. The slope of that graph gives "
  "the acceleration instead.")

S = "Work, energy and power"
q(1, M, S, "What is the kinetic energy of a 2 kg ball moving at 5 m/s?",
  ["10 J", "25 J", "50 J", "5 J"], 1,
  "Kinetic energy is ½ m v² = 0.5 × 2 × 5² = 25 J. Forgetting the ½ gives 50 J, and using m × v instead of v² "
  "gives 10 J.",
  check=("0.5*2*5**2", 0.005))
q(1, M, S, "A 3 kg book is lifted 2 m. By how much does its gravitational potential energy increase? (g = 9.81 m/s²)",
  ["6 J", "14.7 J", "58.9 J", "588.6 J"], 2,
  "The gain is m g h = 3 × 9.81 × 2 ≈ 58.9 J. Leaving out g gives 6 J, and dividing by 2 instead of multiplying "
  "gives 14.7 J.",
  check=("3*9.81*2", 0.005))
q(1, M, S, "A machine does 6000 J of work in 20 s. What is its power output?",
  ["120 000 W", "300 W", "0.0033 W", "6020 W"], 1,
  "Power = work / time = 6000 / 20 = 300 W. Multiplying work by time gives 120 000.",
  check=("6000/20", 0.005))
q(1, M, S, "Which of these is equal to one joule?",
  ["1 N·m", "1 N/m", "1 kg·m/s", "1 W/s"], 0,
  "Work = force × distance, so 1 J = 1 N × 1 m = 1 N·m. A joule is also one watt-second (W·s), not W/s.")
q(1, M, S, "A 60 W lamp is switched on for 5 hours. How much energy does it use, in watt-hours?",
  ["12 Wh", "65 Wh", "300 Wh", "300 W"], 2,
  "Energy = power × time = 60 W × 5 h = 300 Wh. Dividing gives 12, and watts alone are a unit of power, not energy.",
  check=("60*5", 0.005))
q(1, M, S, "A 1500 kg car is travelling at 20 m/s. What is its kinetic energy?",
  ["30 kJ", "300 kJ", "600 kJ", "15 kJ"], 1,
  "Kinetic energy = ½ m v² = 0.5 × 1500 × 20² = 300 000 J = 300 kJ. Forgetting the ½ gives 600 kJ.",
  check=("0.5*1500*20**2/1000", 0.005))
q(1, M, S, "A pump lifts 300 kg of water through 8 m in 60 s. Taking g = 9.81 m/s², what useful power does it deliver?",
  ["39 W", "392 W", "23 544 W", "3924 W"], 1,
  "Work = m g h = 300 × 9.81 × 8 ≈ 23 544 J. Power = work / time = 23 544 / 60 ≈ 392 W. The third option forgets "
  "to divide by the time.",
  check=("300*9.81*8/60", 0.005))

S = "Simple machines (levers, pulleys, inclined planes)"
q(1, M, S, "A pulley system has 4 rope segments supporting the load. Ignoring friction, what effort is needed to lift a 400 N load?",
  ["1600 N", "400 N", "100 N", "4 N"], 2,
  "With 4 supporting segments the ideal mechanical advantage is 4, so the effort is 400 / 4 = 100 N, pulled "
  "through four times the distance the load rises.",
  check=("400/4", 0.005))
q(1, M, S, "Why does a longer handle make it easier to loosen a tight nut with a spanner?",
  ["It reduces the friction in the thread", "It increases the torque produced by the same force",
   "It reduces the total energy needed", "It makes the nut lighter"], 1,
  "Torque = force × perpendicular distance from the pivot. A longer handle turns the same hand force into a "
  "larger torque. The work done stays the same (ignoring losses): the hand just moves through a larger distance.")
q(1, M, S, "A wheelbarrow carries a 600 N load that sits 0.4 m from the wheel axle. The handles are 1.2 m from the axle. What upward force at the handles balances the load?",
  ["200 N", "1800 N", "600 N", "50 N"], 0,
  "Balance the moments about the axle: F × 1.2 = 600 × 0.4, so F = 240 / 1.2 = 200 N. Inverting the ratio gives 1800 N.",
  check=("600*0.4/1.2", 0.005))
q(1, M, S, "A machine has an ideal mechanical advantage of 5, but because of friction its actual mechanical advantage is 4. What is its efficiency?",
  ["125%", "80%", "20%", "9%"], 1,
  "Efficiency = actual mechanical advantage / ideal mechanical advantage = 4 / 5 = 0.8 = 80%. Inverting the ratio "
  "gives 125%, which is impossible for a real machine.",
  check=("4/5*100", 0.005))
q(1, M, S, "A frictionless ramp 5 m long raises a 500 N crate through a height of 2 m. What force along the slope pushes the crate up?",
  ["200 N", "1250 N", "500 N", "80 N"], 0,
  "Without friction, work in equals work out: F × 5 = 500 × 2, so F = 200 N. Inverting the ratio gives 1250 N, "
  "which is more than the crate's weight and would defeat the purpose of a ramp.",
  check=("500*2/5", 0.005))
q(1, M, S, "Which of these is a simple machine?",
  ["An electric motor", "A lever", "A thermostat", "A battery"], 1,
  "The classic simple machines are the lever, wheel and axle, pulley, inclined plane, wedge and screw. A motor, "
  "a thermostat and a battery are not on that list.")
q(1, M, S, "In an ideal pulley system, the effort rope is pulled 6 m while the load rises 2 m. What is the ideal mechanical advantage?",
  ["0.33", "2", "3", "12"], 2,
  "Ideal mechanical advantage = effort distance / load distance = 6 / 2 = 3. Inverting the ratio gives 0.33.",
  check=("6/2", 0.005))

S = "Pressure and basic fluid statics"
q(1, M, S, "A 70 kg person stands on one foot with a contact area of 0.02 m². What pressure do they exert on the ground? (g = 9.81 m/s²)",
  ["34.3 kPa", "3.5 kPa", "687 kPa", "0.34 kPa"], 0,
  "Pressure = force / area, and the force is the weight: 70 × 9.81 ≈ 687 N. P = 687 / 0.02 ≈ 34 300 Pa = 34.3 kPa. "
  "Forgetting g gives 3.5 kPa, and 687 is the force before dividing by the area.",
  check=("70*9.81/0.02/1000", 0.005))
q(1, M, S, "Atmospheric pressure at sea level is about 101 kPa. What is that in bar, where 1 bar = 100 kPa?",
  ["1.01 bar", "10.1 bar", "0.101 bar", "101 000 bar"], 0,
  "Divide by 100: 101 / 100 = 1.01 bar. The other values slip the decimal point or convert to pascals.",
  check=("101/100", 0.005))
q(1, M, S, "A fixed force acts on a surface. What happens to the pressure if the area it acts on is doubled?",
  ["It doubles", "It is halved", "It stays the same", "It quadruples"], 1,
  "Pressure = force / area, so doubling the area with the same force halves the pressure. This is why snowshoes "
  "spread a person's weight over a larger area.")
q(1, M, S, "In a still liquid, at which of these depths is the hydrostatic pressure greatest?",
  ["At the surface", "At 2 m depth", "At 5 m depth", "At 1 m depth"], 2,
  "Hydrostatic pressure is ρ × g × h, which grows in proportion to the depth, so the greatest pressure is at 5 m.")
q(1, M, S, "A hydraulic jack has a small piston of area 0.001 m² and a large piston of area 0.02 m². A 50 N force is applied to the small piston. What force does the large piston produce?",
  ["2.5 N", "1000 N", "50 000 N", "20 N"], 1,
  "The pressure is the same on both pistons: F₁ / A₁ = F₂ / A₂, so F₂ = 50 × 0.02 / 0.001 = 1000 N. The force is "
  "multiplied by the area ratio of 20, at the cost of moving the small piston 20 times further.",
  check=("50*0.02/0.001", 0.005))

S = "Temperature and heat basics"
q(1, M, S, "Convert a temperature of 25 °C to kelvin.",
  ["298 K", "248 K", "25 K", "77 K"], 0,
  "Kelvin = Celsius + 273.15, so 25 °C = 298.15 K, about 298 K. Subtracting gives 248, and 77 is the value in "
  "degrees Fahrenheit, not kelvin.",
  check=("25+273.15", 0.005))
q(1, M, S, "Water boils at 100 °C at sea level. What is this in degrees Fahrenheit? (°F = °C × 1.8 + 32)",
  ["132 °F", "212 °F", "180 °F", "373 °F"], 1,
  "°F = 100 × 1.8 + 32 = 212 °F. Forgetting to add 32 gives 180, and 373 is the temperature in kelvin.",
  check=("100*1.8+32", 0.005))
q(1, M, S, "Which mode of heat transfer does not need any material between the source and the receiver?",
  ["Conduction", "Convection", "Radiation", "Evaporation"], 2,
  "Radiation carries heat as electromagnetic waves, so it works through a vacuum, which is how the Sun warms the "
  "Earth. Conduction and convection both need matter.")
q(1, M, S, "How much heat is needed to raise 0.5 kg of aluminium from 20 °C to 60 °C? (specific heat of aluminium = 900 J/(kg·°C))",
  ["1.8 kJ", "18 kJ", "36 kJ", "45 kJ"], 1,
  "Q = m × c × ΔT = 0.5 × 900 × (60 − 20) = 18 000 J = 18 kJ. Forgetting the mass gives 36 kJ.",
  check=("0.5*900*40/1000", 0.005))

# ====================================================================================
# ELECTRICAL (50)
# ====================================================================================
S = "Voltage, current and resistance"
q(1, E, S, "Which unit is used to measure electrical resistance?",
  ["Ampere", "Volt", "Ohm", "Watt"], 2,
  "Resistance is measured in ohms (Ω). The ampere is the unit of current, the volt of voltage and the watt of power.")
q(1, E, S, "What does a voltmeter measure?",
  ["The flow of charge per second", "The potential difference between two points",
   "The resistance of a component", "The energy used over time"], 1,
  "A voltmeter measures the potential difference (voltage) between two points, so it is connected across the "
  "component. Current is measured by an ammeter and resistance by an ohmmeter.")
q(1, E, S, "How must an ammeter be connected to measure the current through a component?",
  ["In parallel with the component", "In series with the component",
   "Across the power supply only", "It does not matter how it is connected"], 1,
  "The ammeter must be in series so the same current flows through it. It has a very low resistance so it barely "
  "disturbs the circuit; connected in parallel it would act almost like a short circuit.")
q(1, E, S, "A current of 2 A flows for 30 seconds. How much charge passes?",
  ["15 C", "60 C", "32 C", "0.067 C"], 1,
  "Charge = current × time = 2 A × 30 s = 60 C. Dividing the numbers gives 15.",
  check=("2*30", 0.005))
q(1, E, S, "Convert a resistance of 4700 Ω to kilo-ohms.",
  ["47 kΩ", "4.7 kΩ", "0.47 kΩ", "4 700 000 kΩ"], 1,
  "Kilo means 1000, so divide by 1000: 4700 Ω = 4.7 kΩ. The other values slip the decimal point or multiply instead.",
  check=("4700/1000", 0.005))
q(1, E, S, "Which two things are needed for current to flow continuously in a circuit?",
  ["A voltage source and a closed path", "A resistor and an open switch",
   "A capacitor and an insulator", "Two batteries and no wires"], 0,
  "A source of potential difference pushes the charge, and a complete closed loop lets it travel round. An open "
  "switch or an insulator breaks the path.")
q(1, E, S, "5 coulombs of charge pass through a lamp every 0.5 seconds. What is the current?",
  ["2.5 A", "10 A", "0.1 A", "5.5 A"], 1,
  "Current = charge / time = 5 / 0.5 = 10 A. Multiplying gives 2.5, and inverting the fraction gives 0.1.",
  check=("5/0.5", 0.005))

S = "Ohm's law"
q(1, E, S, "What voltage is needed to drive 3 A through a 15 Ω resistor?",
  ["5 V", "18 V", "45 V", "0.2 V"], 2,
  "V = I × R = 3 × 15 = 45 V. Dividing gives 5, and adding the numbers gives 18.",
  check=("3*15", 0.005))
q(1, E, S, "A heating element of 4.5 Ω carries a current of 2 A. What is the voltage across it?",
  ["9 V", "2.25 V", "6.5 V", "0.44 V"], 0,
  "V = I × R = 2 × 4.5 = 9 V. Dividing resistance by current gives 2.25, and adding gives 6.5.",
  check=("4.5*2", 0.005))
q(1, E, S, "A lamp with a resistance of 240 Ω is connected to a 230 V supply. What current does it draw?",
  ["0.96 A", "1.04 A", "55 200 A", "10 A"], 0,
  "I = V / R = 230 / 240 ≈ 0.96 A. Inverting the fraction gives 1.04, and multiplying gives the absurd 55 200.",
  check=("230/240", 0.005))
q(1, E, S, "The voltage across a fixed resistor is doubled. What happens to the current through it?",
  ["It doubles", "It is halved", "It stays the same", "It quadruples"], 0,
  "Ohm's law: I = V / R. For a fixed resistance, current is proportional to voltage, so doubling the voltage "
  "doubles the current.")
q(1, E, S, "A resistor's value is doubled while the supply voltage stays the same. What happens to the current?",
  ["It doubles", "It stays the same", "It is halved", "It quadruples"], 2,
  "I = V / R. With the voltage fixed, doubling R halves the current.")
q(1, E, S, "A circuit on a 24 V supply carries 0.8 A. What is its total resistance?",
  ["19.2 Ω", "30 Ω", "0.033 Ω", "24.8 Ω"], 1,
  "R = V / I = 24 / 0.8 = 30 Ω. Multiplying gives 19.2, and inverting the fraction gives 0.033.",
  check=("24/0.8", 0.005))
q(1, E, S, "A resistor carries 250 mA when 5 V is across it. What is its resistance?",
  ["1250 Ω", "0.02 Ω", "20 Ω", "245 Ω"], 2,
  "Convert first: 250 mA = 0.25 A. R = V / I = 5 / 0.25 = 20 Ω. Treating 250 as amps gives 0.02 Ω, and "
  "multiplying 5 × 250 gives 1250.",
  check=("5/0.25", 0.005))

S = "Electrical power and energy (P = VI)"
q(1, E, S, "A 12 V car headlamp draws 5 A. What is its power?",
  ["2.4 W", "7 W", "60 W", "17 W"], 2,
  "P = V × I = 12 × 5 = 60 W. Dividing gives 2.4, and adding gives 17.",
  check=("12*5", 0.005))
q(1, E, S, "A 100 W bulb is connected to a 230 V supply. What current does it draw?",
  ["0.435 A", "2.3 A", "23 000 A", "0.0043 A"], 0,
  "I = P / V = 100 / 230 ≈ 0.435 A. Inverting the fraction gives 2.3, and multiplying gives 23 000.",
  check=("100/230", 0.005))
q(1, E, S, "A 10 Ω resistor carries a current of 3 A. How much power does it dissipate?",
  ["30 W", "90 W", "9 W", "300 W"], 1,
  "P = I² × R = 3² × 10 = 90 W. Multiplying current by resistance gives the voltage (30 V), not the power.",
  check=("3**2*10", 0.005))
q(1, E, S, "A 5 Ω resistor has 20 V across it. What power does it dissipate?",
  ["100 W", "4 W", "80 W", "25 W"], 2,
  "P = V² / R = 20² / 5 = 80 W. Multiplying voltage by resistance gives 100, and V / R = 4 is the current in amps.",
  check=("20**2/5", 0.005))
q(1, E, S, "A 2000 W kettle runs for 6 minutes. How much energy does it use, in kWh?",
  ["0.2 kWh", "12 kWh", "0.33 kWh", "2 kWh"], 0,
  "Six minutes is 0.1 hour, so energy = 2 kW × 0.1 h = 0.2 kWh. Forgetting to convert minutes to hours gives 12.",
  check=("2*6/60", 0.005))
q(1, E, S, "Electricity costs 0.20 euros per kWh. A 1.5 kW heater runs for 4 hours. What does that cost?",
  ["1.20 euros", "0.30 euros", "6.00 euros", "7.50 euros"], 0,
  "Energy = 1.5 kW × 4 h = 6 kWh. Cost = 6 × 0.20 = 1.20 euros. The 6.00 figure is the energy in kWh, with no "
  "price applied.",
  check=("1.5*4*0.20", 0.005))
q(1, E, S, "Which of these is a unit of energy?",
  ["Watt", "Kilowatt-hour", "Ampere", "Volt"], 1,
  "The kilowatt-hour is a unit of energy (power × time) and is what electricity bills use. The watt is power, "
  "the ampere is current and the volt is voltage.")

S = "Series and parallel resistors"
q(1, E, S, "A 5 Ω and a 15 Ω resistor are connected in series across a 20 V supply. What current flows?",
  ["4 A", "1 A", "0.25 A", "20 A"], 1,
  "Series resistances add: 5 + 15 = 20 Ω. Then I = V / R = 20 / 20 = 1 A.",
  check=("20/(5+15)", 0.005))
q(1, E, S, "Two 100 Ω resistors are connected in parallel across a 10 V supply. What total current is drawn?",
  ["0.05 A", "0.1 A", "0.2 A", "20 A"], 2,
  "Each branch has the full 10 V across it, so each carries 10 / 100 = 0.1 A. In parallel the branch currents "
  "add: 0.1 + 0.1 = 0.2 A, which corresponds to an equivalent resistance of 50 Ω.",
  check=("10/100+10/100", 0.005))
q(1, E, S, "In a series circuit, which quantity is the same through every component?",
  ["Voltage", "Current", "Resistance", "Power"], 1,
  "A series circuit has a single path, so the same current flows through every component. The voltage is shared "
  "out between them.")
q(1, E, S, "In a parallel circuit, which quantity is the same across every branch?",
  ["Current", "Resistance", "Voltage", "Power"], 2,
  "Every branch of a parallel circuit is connected across the same two points, so each branch has the same "
  "voltage. The current splits between the branches.")
q(1, E, S, "Resistors of 6 Ω and 3 Ω are connected in parallel. What is the equivalent resistance?",
  ["9 Ω", "4.5 Ω", "2 Ω", "18 Ω"], 2,
  "For two resistors in parallel, R = (R₁ × R₂) / (R₁ + R₂) = 18 / 9 = 2 Ω. Adding gives the series value of 9 Ω, "
  "and 4.5 Ω is just the average. A parallel combination is always smaller than the smallest resistor.",
  check=("6*3/(6+3)", 0.005))
q(1, E, S, "Three 30 Ω resistors are connected in parallel. What is the equivalent resistance?",
  ["90 Ω", "30 Ω", "10 Ω", "0.1 Ω"], 2,
  "n equal resistors in parallel give R / n = 30 / 3 = 10 Ω. The 90 Ω option is the series value.",
  check=("30/3", 0.005))
q(1, E, S, "A 12 V battery is connected across two resistors in series, 4 Ω and 8 Ω. What is the voltage across the 8 Ω resistor?",
  ["4 V", "6 V", "8 V", "12 V"], 2,
  "The current is 12 / (4 + 8) = 1 A. The voltage across the 8 Ω resistor is 1 × 8 = 8 V, and the 4 Ω resistor "
  "takes the other 4 V. The larger resistance takes the larger share of the voltage.",
  check=("12*8/(4+8)", 0.005))

S = "DC versus AC basics"
q(1, E, S, "Which of these supplies direct current (DC)?",
  ["A household wall socket", "A battery", "An alternator output", "A transformer secondary"], 1,
  "A battery supplies direct current. Wall sockets and alternators supply alternating current, and transformers "
  "only work with AC.")
q(1, E, S, "What is the period of a 50 Hz alternating signal?",
  ["50 s", "0.2 s", "0.02 s", "2 s"], 2,
  "Period = 1 / frequency = 1 / 50 = 0.02 s (20 ms) for each full cycle.",
  check=("1/50", 0.005))
q(1, E, S, "What does 'RMS' stand for when describing an AC voltage?",
  ["Rapid measured signal", "Root mean square", "Real maximum supply", "Rated motor speed"], 1,
  "RMS means root mean square. The RMS value of an AC voltage is the DC voltage that would give the same heating "
  "power in a resistor, which is why the 230 V on a mains socket is quoted as an RMS value.")
q(1, E, S, "An AC supply has a peak voltage of 325 V. What is its RMS value? (RMS = peak / √2)",
  ["460 V", "230 V", "325 V", "162 V"], 1,
  "RMS = peak / √2 = 325 / 1.414 ≈ 230 V. Multiplying by √2 gives 460, and dividing by 2 gives 162.",
  check=("325/2**0.5", 0.005))
q(1, E, S, "What is the usual shape of the mains AC voltage waveform?",
  ["Square wave", "Sine wave", "Constant straight line", "Sawtooth"], 1,
  "Generators produce a voltage that rotates smoothly through each cycle, giving a sine wave. A constant "
  "straight line would be DC.")
q(1, E, S, "Which statement about direct current (DC) is correct?",
  ["It reverses direction 50 times per second", "It flows in one direction only",
   "It cannot power electronics", "It requires a transformer to flow"], 1,
  "In direct current the charge flows in a single direction, as from a battery. Most electronic circuits "
  "actually run on DC.")

S = "Conductors, insulators and wire basics"
q(1, E, S, "Which of these metals is the best electrical conductor?",
  ["Steel", "Lead", "Silver", "Titanium"], 2,
  "Silver has the lowest resistivity of the common metals and conducts best, followed closely by copper. Steel, "
  "lead and titanium conduct noticeably worse.")
q(1, E, S, "Why are electrical wires usually made of copper?",
  ["It has low resistance and is relatively affordable", "It is the only metal that conducts",
   "It is an insulator that guides current", "It is magnetic"], 0,
  "Copper has very low resistivity, second only to silver, and costs far less than silver. All metals conduct, "
  "and copper is not magnetic.")
q(1, E, S, "A copper wire is made twice as long, with the same cross-sectional area. What happens to its resistance?",
  ["It is halved", "It doubles", "It stays the same", "It quadruples"], 1,
  "R = ρ × L / A, so resistance is proportional to length. Doubling the length doubles the resistance.")
q(1, E, S, "A copper wire has a resistivity of 1.7×10⁻⁸ Ω·m, a length of 10 m and a cross-sectional area of 1×10⁻⁶ m². What is its resistance?",
  ["0.17 Ω", "1.7 Ω", "0.017 Ω", "170 Ω"], 0,
  "R = ρ × L / A = 1.7×10⁻⁸ × 10 / 1×10⁻⁶ = 0.17 Ω. The other values come from slipping a power of ten.",
  check=("1.7e-8*10/1e-6", 0.005))
q(1, E, S, "What generally happens to the resistance of a metal wire as its temperature rises?",
  ["It increases", "It decreases", "It stays exactly the same", "It drops to zero"], 0,
  "In metals, higher temperature makes the atoms vibrate more, which scatters the moving electrons and raises "
  "the resistance. Some other materials, such as thermistors, behave differently.")
q(1, E, S, "Which material is commonly used as the insulating coating on household wires?",
  ["Copper", "Steel", "Plastic (PVC)", "Aluminium"], 2,
  "Household wire is coated with plastic such as PVC, which is an insulator. The metals listed all conduct.")

S = "Electrical safety, fuses and breakers"
q(1, E, S, "A circuit breaker 'trips'. What has most likely happened?",
  ["The current exceeded its rating, so it opened the circuit", "The voltage dropped to zero",
   "The wire became an insulator", "Energy was stored in it"], 0,
  "A circuit breaker opens automatically when the current exceeds its rating (an overload or short circuit), "
  "protecting the wiring. It can be reset once the fault is fixed.")
q(1, E, S, "An appliance normally draws 4 A. Fuses are available in 3 A, 5 A, 13 A and 30 A. Which is the most suitable?",
  ["3 A", "5 A", "13 A", "30 A"], 1,
  "A fuse must be rated above the normal current, so it does not blow needlessly, but not much higher, so it "
  "still protects. 5 A is the smallest rating above 4 A. A 3 A fuse would blow in normal use.")
q(1, E, S, "Why should you never replace a blown fuse with a much higher-rated one?",
  ["It lets dangerous overcurrent flow without breaking the circuit", "It increases the supply voltage",
   "It makes the appliance run faster", "It reduces the energy bill"], 0,
  "The fuse rating protects the wiring and the appliance. A much larger fuse will not blow when the current is "
  "too high, so the wires can overheat and start a fire.")
q(1, E, S, "What is the purpose of the earth connection on a metal appliance casing?",
  ["It stores charge for later use", "It boosts the supply voltage", "It reduces the energy bill",
   "It gives fault current a safe path, so a fuse or breaker trips"], 3,
  "If a live wire touches the metal casing, the earth wire carries a large fault current to ground. That current "
  "trips the fuse or breaker, so the casing does not stay live.")
q(1, E, S, "What should you do before replacing a lamp in a light fitting?",
  ["Keep the power on and use dry hands", "Touch the contacts to test them",
   "Switch off and isolate the supply first", "Wear a metal watch for better grip"], 2,
  "Always switch off and isolate the supply before touching any part of a fitting. Dry hands do not make live "
  "contacts safe, and metal jewellery is a conductor.")

S = "Basic components (resistor, capacitor, inductor, diode)"
q(1, E, S, "Which unit is used to measure capacitance?",
  ["Henry", "Farad", "Ohm", "Tesla"], 1,
  "Capacitance is measured in farads (F). The henry is the unit of inductance, the ohm of resistance and the tesla "
  "of magnetic flux density.")
q(1, E, S, "Which unit is used to measure inductance?",
  ["Henry", "Farad", "Siemens", "Coulomb"], 0,
  "Inductance is measured in henries (H). The farad is for capacitance, the siemens for conductance and the "
  "coulomb for charge.")
q(1, E, S, "What is the main purpose of a resistor in a circuit?",
  ["To limit current or divide voltage", "To amplify a signal", "To store charge permanently", "To generate AC"], 0,
  "A resistor opposes current flow. It is used to limit current, for example to protect an LED, and in pairs to "
  "divide a voltage. It cannot amplify a signal or store charge.")
q(1, E, S, "A switch in a branch of a circuit is open. What is the current in that branch?",
  ["Maximum", "Zero", "Double", "Unchanged"], 1,
  "An open switch breaks the circuit, so there is no complete path and the current is zero. A closed switch lets "
  "the current flow.")
q(1, E, S, "Which component is the key element in a rectifier that converts AC to DC?",
  ["Resistor", "Diode", "Fuse", "Inductor"], 1,
  "A rectifier uses diodes, which let current pass in one direction only. A smoothing capacitor is usually added "
  "to reduce the ripple.")
