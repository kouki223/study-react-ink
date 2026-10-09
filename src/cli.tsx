import React,  { useEffect, useState } from "react";
import { Box, render, Text } from "ink";
import { google, createGoogle } from "@ai-sdk/google";
import { CoreMessage, streamText } from "ai";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";

const tones = [
 { label: "default", value: "default", prompt: "" },
 { label: "friendly", value: "friendly", prompt: "あなたはユーザーと近しい友人です。フレンドリーな口調で話します" },
 { label: "business", value: "business", promp: "あなたは有能なコンサルタントです。ビジネスライクな口調で話します。" },
 { label: "pirate", value: "pirate", promp: "あなたは愉快な海賊です。荒っぽく陽気な口調で話します" }
]

const App = () => {
 const [input, setInput] = useState("");
 const [messages, setMessages] = useState<CoreMassage[]>([]);
 const [response, setResponse] = useState("");
 const [loading, setLoading] = useState(false);
 const [selectingTone, setSelectingTone] = useState(false);
 const [selectedTone, setSelectedTone] = useState(tones[0]);

 const hundleSubmit = async () => {
  if (input.trim() === "")  return;
  setInput("");

  if (input === "/tone") {
   setSelectingTone(true);
   return; 
  }

  const res = await generateResponse(input);
  setMessages((prev) => [
   ...prev,
   { role: "user", content: input },
   { role: "assistant", content: res},
  ]);
 };

 const generateResponse = async (prompt: string): Promise<string> => {
  setLoading(true);
  const systemMessage: CoreMessage | null = selectedTone.systemPrompt ? { role: " system", content: selectedTone.systemPrompt } : null;

  const messageToSend: CoreMessage[] = systemMessage ? [systemMessage, ...messages, {role: "user", content: prompt}] : [...messages, {role: "user", content: prompt}];

  const res = streamText({
   model: google("gemini-3.5-flash-lite"),
   messages: messageToSend,
  });

  let fullResponse = "";
  for await (const chunk of res.textStream) {
   setLoading(false);
   setResponse((prev) => prev + chunk);
   fullResponse += chunk;
  }
  setResponse("");

  return fullResponse;
 };

 type SelectItem = {
  label: string;
  value: string;
 };

 const handleSelectTone = (item: SelectItem) => {
  const selected = tones.find((tone) => tone.value === item.value);
  if (!selected) return;

  setSelectedTone(selected);
  setSelectingTone(false);
 };

 if (selectingTone) {
  return (
    <Box  flexDirection="column">
     <Text>Select AI Tone：</Text>
     <SelectInput items={tones} onSelect={handleSelectTone} />
    </Box>
  );
 }

 return (
  <Box flexDirection="column">
  <Text color="white">agent tone: {selectedTone.label}</Text>
  {messages.map((message, index) => (
    <Text key={index} color={message.role === "user" ? "green" : "white"}>
     {message.role}:{" "}
     {typeof message.content === "string" ? message.content : ""}
    </Text>
   ))}
   {loading && (
    <Text color="yellow">
     <Spinner type="dots" /> Loading...
    </Text>
   )}
   <Text color="white">{response}</Text>

   <Box marginRight={1} borderColor="gray" borderStyle="round">
    <Text color="white">{">"} </Text>
    <TextInput
     value={input}
     onChange={(input) => {
      setInput(input);
     }}
     onSubmit={() => hundleSubmit()}
     placeholder="Type your message here..."
    />
   </Box>
  </Box>
 );
};
render(<App />);
