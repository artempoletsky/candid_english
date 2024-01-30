import validate, { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import { SynonymsData, TestQuestion, TestRecord, TestWord, User, VariedArrays, query } from "~/db";
import { dbConnect, getCollection, rfs } from "~/lib/util";

// import _ from "lodash";

type PayloadType = {
  userid: number
  title: string
}



async function copySynonimsFromMongo() {

  await dbConnect();
  const t1 = performance.now();
  const col = getCollection("ReversoSynonyms");
  const docs: any[] = await col.find().toArray();
  // console.log(docs);
  const time1 = perf(t1);
  const t2 = performance.now();
  type Payload = typeof docs;
  let result;

  const syn: SynonymsData[] = [];
  for (const d of docs) {
    let part: string = "";
    const data: any = {};

    for (const key in d) {
      if (key != "_id" && key != "word") {
        if (key == "adverb / other") {
          part = "other"
        } else {
          part = key;
        }
        data[part] = d[key];
      }
    }
    if (!part) {
      console.log(d);
      continue;
    }
    syn.push({
      word: d.word,
      data
    });
  }

  result = await query<SynonymsData[]>(({ }, { payload, db }) => {
    if (db.doesTableExist("synonyms")) {
      db.removeTable("synonyms");
    }
    let synonyms = db.createTable<string, SynonymsData>({
      name: "synonyms",
      fields: {
        word: "string",
        data: "json",
      },
      tags: {
        word: ["primary"],
      },
      settings: {
        dynamicData: false,
        largeObjects: false,
        manyRecords: true,
      }
    });

    synonyms.insertMany(payload);
    return synonyms.all().select();
  }, syn);

  return {
    result,
    time1,
    time2: perf(t2),
  };
}


async function queryExample() {
  const t1 = performance.now();



  let result = await query(({ test_words }, { db }) => {
    test_words.createIndex("level", false);
    test_words.createIndex("part", false);
    test_words.createIndex("oxfordLevel", false);
    // return test_questions.all().select();
  });

  return {
    result,
    time: perf(t1),
  };
}



async function fillQuestionsTable() {
  const t1 = performance.now();
  const customQuestions: any = {};
  customQuestions.c2 = rfs("/data/custom_questions/c2.json").map((q: any) => {
    q.difficulty = "c2";
    return q;
  });

  let result = await query<any>(({ test_words, synonyms }, { payload, db, _ }) => {
    if (db.doesTableExist("test_questions")) {
      db.removeTable("test_questions");
    }
    let test_questions = db.createTable<string, TestQuestion>({
      name: "test_questions",
      fields: {
        correctAnswers: "json",
        difficulty: "string",
        options: "json",
        template: "string",
        word: "string",
      },
      tags: {
        difficulty: ["index"],
        word: ["primary"],
      },
      settings: {
        dynamicData: false,
        largeObjects: false,
        manyRecords: true,
      }
    });

    const allWords = test_words.filter(word => word.level != "x").limit(0).select();

    const questions: TestQuestion[] = [];
    for (const word of allWords) {
      const syn = synonyms.at(word.word);

      if (!syn || !syn.data[word.part as "verb"]) {
        // console.log("No synonyms data for the part", word.part, syn);
        // console.log(word);
        continue;
      }

      const synPartData = syn.data[word.part as "verb"];
      const mainSynonym = synPartData.relevant[0];
      const optionsCandidates = test_words
        .where("level", word.level)
        // .where("part", word.part)
        .filter(doc => {
          // debugger;?
          if (doc.part != word.part) return false;
          if (doc.word == syn.word) return false;
          if (synPartData.relevant.includes(doc.word)) return false;
          if (synPartData.other.includes(doc.word)) return false;
          return true
        }).select(doc => doc.word);

      if (optionsCandidates.length == 0) {
        console.info(`Options candidates are empty for the word ${word.word}`);
      } else {
        // console.log(optionsCandidates, word.word);
      }

      if (word.level == "x") throw new Error("Wrong word level");

      questions.push({
        template: `A most related word (a synonym) for <strong>${word.word}</strong> is {...}`,
        correctAnswers: [mainSynonym],
        difficulty: word.level,
        options: [_.sampleSize(optionsCandidates, 4)],
        word: word.word,
      });
    }
    test_questions.insertMany(questions);

    test_questions.insertMany(payload.c2);

    test_questions.all().update(doc => {
      const { options } = doc;
      for (let i = 0; i < options.length; i++) {
        const o = options[i];
        o.splice(Math.floor(Math.random() * o.length), 0, doc.correctAnswers[i]);
      }
      doc.options = options;
    });
    return test_questions.all().select();
  }, customQuestions);

  return {
    result,
    time: perf(t1),
  };
}

function perf(t1: number) {
  return `${Math.floor((performance.now() - t1) * 100) / 100} ms`;
}


export const POST = NextPOST(NextResponse, {
  queryExample: {},
  fillQuestionsTable: {},
  copySynonimsFromMongo: {},
}, {
  queryExample,
  fillQuestionsTable,
  copySynonimsFromMongo,
});