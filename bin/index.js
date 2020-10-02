#!/usr/bin/env node
const program = require("commander");
const download = require("download-git-repo");
const inquire = require("inquirer");
const fs = require("fs");
const handlebars = require("handlebars");
const ora = require("ora");
const chalk = require("chalk");
const symbols = require("log-symbols");
const { 
    execSync
 } = require('child_process')

program.version("1.0.0", "-v,--version")
    .command("init <name>")
    .action((name) => {
        if (fs.existsSync(name)) {
            console.log(symbols.error, chalk.red('项目已存在'))
            return
        }
        inquire.prompt([
            {
                name: "description",
                message: "请输入项目描述"
            },
            {
                name: "author",
                message: "请输入作者名称"
            }
        ]).then((answers) => {
            const spinner = ora('正在下载模板...');
            spinner.start();
            download("direct:https://github.com/LiuJinYang9527/umi-cli", name, { clone: true }, (err) => {
                if (err) {
                    spinner.fail();
                    console.log(symbols.error, chalk.red(err))
                    return;
                }
                spinner.succeed();
                const meta = {
                    name,
                    description: answers.description,
                    author: answers.author
                };
                const fileName = `${name}/package.json`;
                const content = fs.readFileSync(fileName).toString();
                const result = handlebars.compile(content)(meta);
                fs.writeFileSync(fileName, result);
                console.log(symbols.success, chalk.green('项目初始化完成'))
                const moduleSpin = ora('安装依赖');
                moduleSpin.start();
                const changeCmd = `cd ${name} && cnpm i`;
                try {
                    execSync(changeCmd);
                    console.log(symbols.success,chalk.green('项目依赖安装完成'));
                    process.exit(0);
                } catch (error) {
                    console.log(symbols.error, chalk.red(error))
                    process.exit(0)
       
                }
            })
        })
    });

program.parse(process.argv);