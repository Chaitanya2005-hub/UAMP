import { CanDeactivateFn } from '@angular/router';
import { ExamRunnerComponent } from '../../student/exam/exam-runner/exam-runner.component';

export const examExitGuard: CanDeactivateFn<ExamRunnerComponent> = (component) => {
  if (component.submissionInProgress && !component.isSubmitted) {
    return confirm('Leaving now will pause your exam and may be flagged. Continue?');
  }
  return true;
};
