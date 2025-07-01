export const themes = {
  light: {
    calculator: "bg-gray-100 text-gray-800",
    display: "bg-white text-gray-800",
    button: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    operatorButton: "bg-orange-400 hover:bg-orange-500 text-white",
    equalsButton: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  dark: {
    calculator: "bg-gray-800 text-gray-100",
    display: "bg-gray-900 text-gray-100",
    button: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    operatorButton: "bg-orange-500 hover:bg-orange-600 text-white",
    equalsButton: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  monokai: {
    calculator: "bg-[#272822] text-[#f8f8f2]",
    display: "bg-[#3e3d32] text-[#f8f8f2]",
    button: "bg-[#75715e] hover:bg-[#8b8675] text-[#f8f8f2]",
    operatorButton: "bg-[#f92672] hover:bg-[#f9508a] text-[#f8f8f2]",
    equalsButton: "bg-[#a6e22e] hover:bg-[#b3e84b] text-[#272822]",
  },
  'tokyo-night': {
    calculator: "bg-[#1a1b26] text-[#a9b1d6]",
    display: "bg-[#24283b] text-[#a9b1d6]",
    button: "bg-[#565f89] hover:bg-[#6b77a4] text-[#a9b1d6]",
    operatorButton: "bg-[#bb9af7] hover:bg-[#c8aef9] text-[#1a1b26]",
    equalsButton: "bg-[#7aa2f7] hover:bg-[#8cb0fa] text-[#1a1b26]",
  },
};

export type Theme = keyof typeof themes;
