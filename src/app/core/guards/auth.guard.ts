import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const appwrite = inject(AppwriteService);
  const router = inject(Router);

  try {
    const user = await appwrite.getUser();
    if (user) {
      return true;
    }
  } catch (e) {
    // Not authenticated
  }

  return router.createUrlTree(['/auth']);
};
