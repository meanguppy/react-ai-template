"use client";
import styles from "./page.module.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { useState, useRef } from "react";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const CustomPaper = styled(Paper)(({ theme }) => ({
  height: 120,
  padding: theme.spacing(2),
  ...theme.typography.body2,
}));

export default function Home() {
  const [loading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultPrompt =
    "Submit a question below to learn about our company policies!";

  const onSubmit = async () => {
    if (!inputRef) {
      setResponse("Internal Error");
      setTimeout(() => {
        setResponse(defaultPrompt);
      }, 1000);
      throw new Error("No input ref");
    }
    setIsLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: inputRef.current!.value }),
    });
    setIsLoading(false);
    if (!res.ok) {
      setResponse("Internal Error");
      setTimeout(() => {
        setResponse(defaultPrompt);
      }, 1000);
      throw new Error(res.statusText);
    }
    const data: { response: string } = await res.json();
    setResponse(data.response);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.page}>
        <main className={styles.main}>
          <CustomPaper elevation={3}>
            {loading && (
              <div className={styles.progress}>
                <CircularProgress />
              </div>
            )}
            {!loading && (response || defaultPrompt)}
          </CustomPaper>
          <Divider />
          <TextField
            label="Ask me anything about our company policies!"
            autoFocus
            fullWidth
            multiline
            minRows={5}
            variant="outlined"
            inputRef={inputRef}
          />
          <Button onClick={onSubmit}>Submit question</Button>
        </main>
      </div>
    </ThemeProvider>
  );
}
