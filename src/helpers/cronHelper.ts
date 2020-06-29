import { CronJob } from "cron";
import { currentDate } from "src/helpers/utilHelper";
import * as assistanceModel from "src/models/assistanceModel";

const cronAssistanceDate = process.env.CRON_AASSISTANCE_DATE ? process.env.CRON_AASSISTANCE_DATE : "* * * * * *";

export const closeAssistanceByDateJob = new CronJob(cronAssistanceDate, async () => {
  const updatedFields = await assistanceModel.updateAllByDate(currentDate(), {
    available: false
  });

  if(process.env.NODE_ENV === "development"){
    if(updatedFields[0].affectedRows){
    // tslint:disable:no-console
      console.log(`[${updatedFields[0].affectedRows} assistance were unavailable automatically at ${currentDate()}]`);
    }
  }

}, null, true, "America/Sao_Paulo");