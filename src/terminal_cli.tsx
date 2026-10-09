import React,  { useEffect, useState } from "react";
import { Box, render, Text } from "ink";
import { google } from "@ai-sdk/google";
import { CoreMessage, streamText } from "ai";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";

const App = () => {
 const [input, setInput] = useState("");
 const [messages, setMessages] = useState<CoreMessage[]>([]);
 const [response, setResponse] = useState("");
 const [loading, setLoading] = useState(false);

 const hundleSubmit = async () => {
  if (input.trim() === "")  return;
  setInput("");
  const res = await generateResponse(input);
  setMessages((prev) => [
   ...prev,
   { role: "user", content: input },
   { role: "assistant", content: res},
  ]);
 };

 const generateResponse = async (prompt: string): Promise<string> => {
  setLoading(true);
  const res = streamText({
   model: google("gemini-3.5-flash-lite"),
   messages: [...messages, { role: "user", content: prompt }],
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
 
 return (
  <Box flexDirection="column">
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
 )
};

render(<App />);
