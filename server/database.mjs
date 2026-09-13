import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
export function openDatabase(filename,migrations){
 mkdirSync(dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL)');
 try{
  db.exec('BEGIN IMMEDIATE');
  for(const name of readdirSync(migrations).filter(f=>f.endsWith('.sql')).sort()){
   const sql=readFileSync(join(migrations,name),'utf8'),hash=createHash('sha256').update(sql).digest('hex');
   const old=db.prepare('SELECT hash FROM app_migrations WHERE name=?').get(name);
   if(old){if(old.hash!==hash)throw new Error('Published migration changed: '+name);continue;}
   db.exec(sql);db.prepare('INSERT INTO app_migrations VALUES (?,?)').run(name,hash);
  }
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');db.close();throw error;}
 return {close:()=>db.close(),prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args);},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}};}};}};
}
