import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";

export const calculatorRouter = router({
  getUI: publicProcedure.output(z.object({
    display: z.object({
      type: z.literal("display"),
    }),
    buttons: z.array(z.object({
      type: z.literal("button"),
      label: z.string(),
      value: z.string(),
      className: z.string(),
    })),
  })).query(() => {
    return {
      display: {
        type: "display",
      },
      buttons: [
        { type: "button", label: "AC", value: "AC", className: "" },
        { type: "button", label: "+/-", value: "+/-", className: "" },
        { type: "button", label: "%", value: "%", className: "" },
        { type: "button", label: "/", value: "/", className: "operator" },
        { type: "button", label: "7", value: "7", className: "" },
        { type: "button", label: "8", value: "8", className: "" },
        { type: "button", label: "9", value: "9", className: "" },
        { type: "button", label: "*", value: "*", className: "operator" },
        { type: "button", label: "4", value: "4", className: "" },
        { type: "button", label: "5", value: "5", className: "" },
        { type: "button", label: "6", value: "6", className: "" },
        { type: "button", label: "-", value: "-", className: "operator" },
        { type: "button", label: "1", value: "1", className: "" },
        { type: "button", label: "2", value: "2", className: "" },
        { type: "button", label: "3", value: "3", className: "" },
        { type: "button", label: "+", value: "+", className: "operator" },
        { type: "button", label: "0", value: "0", className: "col-span-2" },
        { type: "button", label: ".", value: ".", className: "" },
      { type: "button", label: "=", value: "=", className: "equals" },
      ],
    };
  }),
  getSDUI: publicProcedure
    .output(
      z.object({
        buttons: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            kind: z.union([z.literal("number"), z.literal("operator"), z.literal("action")]),
          }),
        ),
        buttonColor: z.string(),
        operatorColor: z.string(),
        textSize: z.string(),
      }),
    )
    .query(() => {
      return {
        buttons: [
          { label: "7", value: "7", kind: "number" },
          { label: "8", value: "8", kind: "number" },
          { label: "9", value: "9", kind: "number" },
          { label: "/", value: "/", kind: "operator" },
          { label: "4", value: "4", kind: "number" },
          { label: "5", value: "5", kind: "number" },
          { label: "6", value: "6", kind: "number" },
          { label: "*", value: "*", kind: "operator" },
          { label: "1", value: "1", kind: "number" },
          { label: "2", value: "2", kind: "number" },
          { label: "3", value: "3", kind: "number" },
          { label: "-", value: "-", kind: "operator" },
          { label: "0", value: "0", kind: "number" },
          { label: "+", value: "+", kind: "operator" },
          { label: "=", value: "=", kind: "action" },
        ],
        buttonColor: "bg-gray-200",
        operatorColor: "bg-orange-400",
        textSize: "text-xl",
      };
    }),
});
