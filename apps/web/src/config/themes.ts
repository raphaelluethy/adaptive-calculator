export const themes = {
	light: {
		flag: "light-theme",
		calculator: "bg-gray-100 text-gray-800",
		display: "bg-white text-gray-800",
		button: "bg-gray-200 hover:bg-gray-300 text-gray-800",
		operatorButton: "bg-orange-400 hover:bg-orange-500 text-white",
		equalsButton: "bg-orange-500 hover:bg-orange-600 text-white",
	},
	dark: {
		flag: "dark-theme",
		calculator: "bg-gray-800 text-gray-100",
		display: "bg-gray-900 text-gray-100",
		button: "bg-gray-700 hover:bg-gray-600 text-gray-100",
		operatorButton: "bg-orange-500 hover:bg-orange-600 text-white",
		equalsButton: "bg-orange-600 hover:bg-orange-700 text-white",
	},
	monokai: {
		flag: "monokai-theme",
		calculator: "bg-[#272822] text-[#f8f8f2]",
		display: "bg-[#3e3d32] text-[#f8f8f2]",
		button: "bg-[#75715e] hover:bg-[#8b8675] text-[#f8f8f2]",
		operatorButton: "bg-[#f92672] hover:bg-[#f9508a] text-[#f8f8f2]",
		equalsButton: "bg-[#a6e22e] hover:bg-[#b3e84b] text-[#272822]",
	},
	"tokyo-night": {
		flag: "tokyo-night-theme",
		calculator: "bg-[#1a1b26] text-[#a9b1d6]",
		display: "bg-[#24283b] text-[#a9b1d6]",
		button: "bg-[#565f89] hover:bg-[#6b77a4] text-[#a9b1d6]",
		operatorButton: "bg-[#bb9af7] hover:bg-[#c8aef9] text-[#1a1b26]",
		equalsButton: "bg-[#7aa2f7] hover:bg-[#8cb0fa] text-[#1a1b26]",
	},
	postmodern: {
		flag: "post-modern-theme",
		calculator:
			"bg-gradient-to-br from-[#ff0080] via-[#7928ca] to-[#ff8a00] text-white",
		display:
			"bg-black text-[#00ff41] border-2 border-[#ff0080] shadow-[0_0_20px_#ff0080]",
		button:
			"bg-[#000] border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transform hover:rotate-3 transition-all duration-200 shadow-[0_0_10px_#00ff41]",
		operatorButton:
			"bg-[#ff0080] border-2 border-[#ffff00] text-black hover:bg-[#ffff00] hover:text-[#ff0080] transform hover:-rotate-3 transition-all duration-200 shadow-[0_0_15px_#ff0080]",
		equalsButton:
			"bg-gradient-to-r from-[#ff0080] to-[#00ff41] border-2 border-[#ffff00] text-black hover:from-[#00ff41] hover:to-[#ff0080] transform hover:scale-110 transition-all duration-300 shadow-[0_0_20px_#ffff00]",
	},
	default: {
		flag: "default-theme",
		calculator: "bg-blue-50 text-blue-900",
		display: "bg-blue-100 text-blue-900",
		button: "bg-blue-200 hover:bg-blue-300 text-blue-900",
		operatorButton: "bg-green-400 hover:bg-green-500 text-white",
		equalsButton: "bg-green-500 hover:bg-green-600 text-white",
	},
	sunset: {
		flag: "sunset-theme",
		calculator: "bg-gradient-to-br from-orange-100 to-red-100 text-orange-900",
		display: "bg-gradient-to-r from-orange-200 to-red-200 text-orange-900",
		button: "bg-orange-300 hover:bg-orange-400 text-orange-900",
		operatorButton: "bg-orange-500 hover:bg-orange-600 text-white",
		equalsButton: "bg-red-500 hover:bg-red-600 text-white",
	},
};

export type Theme = keyof typeof themes;
