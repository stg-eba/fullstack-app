
const cron = require('node-cron');
const { ScheduledTask, TaskLog } = require('../models'); 
const { Op } = require('sequelize');
const cronParser = require('cron-parser');


const logTask = async (taskId, level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - [${level.toUpperCase()}] ${message}`;
  console.log(logMessage); 

  try {

    await TaskLog.create({
      taskId: taskId,
      level: level,
      message: message,
    });

    await ScheduledTask.update({ lastLogMessage: message }, { where: { id: taskId } });
  } catch (dbError) {
    console.error('Failed to write log to database:', dbError);
  }
};


const scheduledTaskWrapper = async (taskRecord) => {
  const taskName = taskRecord.name;
  const taskId = taskRecord.id;
  let attempt = 0;
  const maxRetries = 3; 

  await logTask(taskId, 'info', `Task started.`);
  await taskRecord.update({ status: 'running', lastRunAt: new Date() });

  const execute = async () => {
    attempt++;
    try {

      console.log(`[${taskName}] Executing attempt ${attempt}...`);

      if (taskName === 'MinuteTask' && Math.random() < 0.5 && attempt <= maxRetries) {
        throw new Error('Simulated task failure');
      }



      const successMsg = `Task completed successfully on attempt ${attempt}.`;
      await logTask(taskId, 'info', successMsg);

      const interval = cronParser.parseExpression(taskRecord.cronSchedule, { currentDate: new Date() });
      const nextRun = interval.next().toDate();
      await taskRecord.update({ status: 'completed', nextRunAt: nextRun });

    } catch (error) {
      const errorMsg = `Task failed on attempt ${attempt}: ${error.message}`;
      await logTask(taskId, 'error', errorMsg);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; 
        await logTask(taskId, 'warn', `Retrying in ${delay / 1000} seconds...`);
        await taskRecord.update({ status: 'retrying' }); 
        setTimeout(execute, delay); 
      } else {
        await logTask(taskId, 'error', `Task failed after ${maxRetries} attempts.`);
        await taskRecord.update({ status: 'failed' });
        
      }
    }
  };

  await execute();
};


const initializeScheduler = async () => {
  console.log('Initializing scheduler...');
  const tasksToSchedule = [
    { name: 'MinuteTask', cronSchedule: '* * * * *' },
    { name: 'DailyCleanup', cronSchedule: '0 3 * * *' },
    // 他のタスク定義
  ];

  for (const taskDef of tasksToSchedule) {
    // DBにタスクが存在するか確認、なければ作成
    let [taskRecord, created] = await ScheduledTask.findOrCreate({
      where: { name: taskDef.name },
      defaults: {
        cronSchedule: taskDef.cronSchedule,
        status: 'idle',
      }
    });

    if (created) {
      console.log(`Task "${taskDef.name}" created in DB.`);
    } else {
      // 既存タスクの場合、スケジュールが変更されていたら更新
      if (taskRecord.cronSchedule !== taskDef.cronSchedule) {
        await taskRecord.update({ cronSchedule: taskDef.cronSchedule });
        console.log(`Task "${taskDef.name}" schedule updated in DB.`);
      }
      // サーバー再起動時に 'running' や 'retrying' 状態だったら 'idle' に戻すなど考慮が必要な場合も
      if (['running', 'retrying'].includes(taskRecord.status)) {
          console.warn(`Task "${taskDef.name}" was in status ${taskRecord.status}. Resetting to idle.`);
          await taskRecord.update({ status: 'idle' });
      }
    }

    // 次回実行時刻を計算して設定 (初回または必要に応じて)
    if (!taskRecord.nextRunAt || taskRecord.nextRunAt < new Date()) {
        try {
            const interval = cronParser.parseExpression(taskRecord.cronSchedule, { currentDate: new Date() });
            taskRecord.nextRunAt = interval.next().toDate();
            await taskRecord.save();
        } catch (err) {
            console.error(`Error parsing cron schedule "${taskRecord.cronSchedule}" for task "${taskRecord.name}": ${err}`);
        }
    }


    console.log(`Scheduling task "${taskRecord.name}" with schedule "${taskRecord.cronSchedule}"`);
    // node-cron でスケジュール登録
    cron.schedule(taskRecord.cronSchedule, () => {
      // スケジュール時刻になったら、最新のタスク情報をDBから取得して実行
      ScheduledTask.findByPk(taskRecord.id).then(currentTaskRecord => {
        if (currentTaskRecord && currentTaskRecord.status !== 'running' && currentTaskRecord.status !== 'retrying') {
           console.log(`Executing scheduled task: ${currentTaskRecord.name}`);
           scheduledTaskWrapper(currentTaskRecord); // DBから取得した最新のレコードを渡す
        } else if (!currentTaskRecord) {
            console.error(`Task with ID ${taskRecord.id} not found for execution.`);
        } else {
            console.warn(`Skipping execution of task "${currentTaskRecord.name}" because its status is ${currentTaskRecord.status}`);
        }
      }).catch(err => {
          console.error(`Error fetching task ${taskRecord.id} before execution:`, err);
      });
    });
  }
   console.log('Scheduler initialized successfully.');
};

module.exports = { initializeScheduler };
