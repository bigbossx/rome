"use strict";
// const importJsx = require("import-jsx");
const React = require("react");
const { render } = require("ink");
const open = require("open");
const { Box, Text } = require("ink");

let i = 1;
module.exports = () => {
  const introduction = "👏 hello gem,my name is Vision_X. is the world’s most advanced ECMAScript module loader. This fast, production ready, zero dependency loader is all you need to support ECMAScript modules in Node 6+. See the release post and video for details!";
 
  const [word, setWord] = React.useState("👏");

  React.useEffect(() => {
    const timer = setInterval(() => {
      setWord(() => introduction.slice(0, ++i));
    }, 100);

    return () => {
      clearInterval(timer);
    };
  });

  return (
    <Box marginBottom={1} width={40} textWrap="wrap">
      <Text>{word}</Text>
    </Box>
  );
};
