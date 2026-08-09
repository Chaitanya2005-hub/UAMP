import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ServerTimeService } from '../services/server-time.service';
import { ExamService } from '../../student/services/exam.service';

export const examTimeWindowGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const examService = inject(ExamService);
  const serverTime = inject(ServerTimeService);
  const router = inject(Router);

  const examId = route.paramMap.get('examId')!;

  const [exam, serverNow] = await Promise.all([
    firstValueFrom(examService.getExam(examId)),
    firstValueFrom(serverTime.now()),
  ]);

  if (exam.status !== 'live' || serverNow < new Date(exam.scheduledStart)) {
    return router.createUrlTree(['/student/exam', examId, 'lobby'], {
      queryParams: { reason: 'not_started' },
    });
  }

  if (serverNow > new Date(exam.scheduledEnd)) {
    return router.createUrlTree(['/student/dashboard'], {
      queryParams: { reason: 'window_closed' },
    });
  }

  return true;
};
