Microsoft Windows [Version 10.0.26300.9818]
(c) Microsoft Corporation. All rights reserved.

C:\Users\rajat>mongosh
Current Mongosh Log ID: 6b03c2145bdcb6c99fd92ae6
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.14.2
Using MongoDB:          9.0.8
Using Mongosh:          2.14.2
mongosh 2.14.3 is available for download: https://www.mongodb.com/try/download/shell

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/

------
   The server generated these startup warnings when booting
   2026-11-16T10:33:54.587+05:30: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
------

test> use studentdb
switched to db studentdb
studentdb> show collection
MongoshInvalidInputError: [COMMON-10001] 'collection' is not a valid argument for "show".
studentdb> db.createcollection
studentdb.createcollection
studentdb> db.createCollection("students")
{ ok: 1 }
studentdb> show collections
students
studentdb> db.students.drop()
true
studentdb> db.dropDatabase()
{ ok: 1, dropped: 'studentdb' }
studentdb> db.students.insertMany([
| { rollNo : 1, name: "Roshan" , age: 889, branch:"CSE", marks:99},
| { rollNo : 2, name: "Rahul" , age: 890, branch:"CSE-AIML", marks:100},
| { rollNo : 3, name: "Rag" , age: 891, branch:"CSE-AI", marks:98},
| { rollNo : 4, name: "Raj" , age: 892, branch:"CSE-DS", marks:95}
| ])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('6b03c37d5bdcb6c99fd92ae7'),
    '1': ObjectId('6b03c37d5bdcb6c99fd92ae8'),
    '2': ObjectId('6b03c37d5bdcb6c99fd92ae9'),
    '3': ObjectId('6b03c37d5bdcb6c99fd92aea')
  }
}
studentdb> db.students.find()
[
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92ae7'),
    rollNo: 1,
    name: 'Roshan',
    age: 889,
    branch: 'CSE',
    marks: 99
  },
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92ae8'),
    rollNo: 2,
    name: 'Rahul',
    age: 890,
    branch: 'CSE-AIML',
    marks: 100
  },
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92ae9'),
    rollNo: 3,
    name: 'Rag',
    age: 891,
    branch: 'CSE-AI',
    marks: 98
  },
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92aea'),
    rollNo: 4,
    name: 'Raj',
    age: 892,
    branch: 'CSE-DS',
    marks: 95
  }
]
studentdb> db.students.find({ $and: [ { age: { $gte: 20 } }, { marks: { $gt: 80 } } ] }) db.students.find({ $or: [ { branch: "CSE" }, { marks: { $gte: 90 } } ] }) db.students.find({ marks: { $not: { $gt: 80 } } })
Uncaught:
SyntaxError: Missing semicolon. (1:77)

> 1 | db.students.find({ $and: [ { age: { $gte: 20 } }, { marks: { $gt: 80 } } ] }) db.students.find({ $or: [ { branch: "CSE" }, { marks: { $gte: 90 } } ] }) db.students.find({ marks: { $not: { $gt: 80 } } })
    |                                                                              ^
  2 |

studentdb> db.students.find({ $and: [ { age: { $gte: 20 } }, { marks: { $gt: 80 } } ] });
[
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92ae7'),
    rollNo: 1,
    name: 'Roshan',
    age: 889,
    branch: 'CSE',
    marks: 99
  },
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92ae8'),
    rollNo: 2,
    name: 'Rahul',
    age: 890,
    branch: 'CSE-AIML',
    marks: 100
  },
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92ae9'),
    rollNo: 3,
    name: 'Rag',
    age: 891,
    branch: 'CSE-AI',
    marks: 98
  },
  {
    _id: ObjectId('6b03c37d5bdcb6c99fd92aea'),
    rollNo: 4,
    name: 'Raj',
    age: 892,
    branch: 'CSE-DS',
    marks: 95
  }
]
studentdb> db.students.updateMany(
| { branch:'CSE' },
| { $set:{ department :'COMPUTER SCIENCE'}})
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
studentdb>
(To exit, press Ctrl+C again or Ctrl+D or type .exit)
studentdb> db.students.find({ $and: [ { age: { $gte: 20 } }, { marks: { $gt: 80 } } ] }) db.students.find({ $or: [ { branch: "CSE" }, { marks: { $gte: 90 } } ] }) db.students.find({ marks: { $not: { $gt: 80 } } })
