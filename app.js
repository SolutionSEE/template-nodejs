import express from 'express'
import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";
import { config } from "dotenv";
config();
const port = process.env.PORT ?? 3000;
const app = express();
app.use(express.static('public'))

app.get('*', async (req, res) => {
    try{
      const datasource = new DataSource({
        type: "sqlite",
        database: "./northwind.db",
      });
      const db = await SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
      });
      const model = new OpenAI({ temperature: 0 });
      const toolkit = new SqlToolkit(db, model);
      const executor = createSqlAgent(model, toolkit);
    
      const input = `List the Order Details`;
    
      console.log(`Executing with input "${input}"...`);
    
      const result = await executor.call({ input });
    
      console.log(`Got output ${result.output}`);
    
      console.log(
        `Got intermediate steps ${JSON.stringify(
          result.intermediateSteps,
          null,
          2
        )}`
      );
    
      await datasource.destroy();
       
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
     res.redirect('/');
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
