const request = require('request-promise');
const cheerio = require('cheerio');
const fs=require("fs");
const json2csv=require("json2csv").Parser;

const url = 'https://stackoverflow.com/questions';
let questions=[];

const fetchQuestions = async () => {
    const response = await request(url);
    const $=cheerio.load(response);
    
    $(".question-summary").each((i, el) => {
        const question_url='https://stackoverflow.com'+$(el)
        .find(".question-hyperlink")
        [0].attribs.href;

        const upvotes=$(el)
        .find(".vote-count-post>strong")
        .text();

        const answers=$(el)
        .find(".status.unanswered>strong")
        .text();

        let hasElem=false;
        for (let i=0;i<questions.length;i++) {
            if (questions[i]["URL"]===question_url) {
                questions[i]["Reference Count"]++;
                questions[i]["# Upvotes"]=upvotes;
                questions[i]["# Answers"]=answers;
                hasElem=true;
                break;
            }
        }

        if (hasElem===false) {
            questions.push({
                'URL': question_url,
                "# Upvotes": upvotes,
                "# Answers": answers,
                "Reference Count": 1
            })
        }
    })
    const parser=new json2csv();
    const csv=parser.parse(questions);
    fs.writeFileSync("./Questions.csv", csv);
    fetchQuestions();
}

for (var i=0;i<5;i++) {fetchQuestions();}