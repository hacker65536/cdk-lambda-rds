import { Handler } from "aws-lambda";
import { SecretsManager } from "aws-sdk";
import * as mysql from "mysql2/promise";

type EmptyHandler = Handler<void, string>;

export const handler: EmptyHandler = async function (event: any) {
  const secretid = process.env.SECRETID;
  const sm = new SecretsManager();
  const response = await sm
    .getSecretValue({
      SecretId: secretid!,
    })
    .promise();

  const dbconf = JSON.parse(response.SecretString!);

  const connection = await mysql.createConnection({
    host: dbconf.host,
    user: dbconf.username,
    password: dbconf.password,
    database: "mysql",
    multipleStatements: true,
  });

  const sql = "show databases";

  try {
    const [rows] = await connection.execute(sql);
    console.log(rows);
    return JSON.stringify(rows);
  } catch (err) {
    console.log(err);
    return "err " + err;
  }
};
