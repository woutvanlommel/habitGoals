import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { LucideAngularModule, Plus, Check, Trash2, Image as ImageIcon, X } from 'lucide-angular';

@Component({
  selector: 'app-add-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  template: `
    <div class="container add-entry-page">
      
      <!-- MORNING ROUTINE (No goals set yet) -->
      <div *ngIf="!hasGoals()" class="fade-in">
        <header class="header text-center">
          <h2>Morning Routine</h2>
          <p class="subtitle">Set your intentions for today.</p>
        </header>

        <form [formGroup]="goalForm" (ngSubmit)="saveGoals()">
          <div formArrayName="goals" class="goals-list">
            <div *ngFor="let goal of goalsArray.controls; let i=index" class="goal-input-group">
              <input [formControlName]="i" 
                     placeholder="I will..." 
                     class="input-field"
                     [class.error]="isFieldInvalid(i)">
              
              <button type="button" *ngIf="goalsArray.length > 3" (click)="removeGoal(i)" class="btn-icon danger">
                <lucide-icon [img]="Trash2" size="20"></lucide-icon>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" (click)="addGoalField()" class="btn btn-ghost">
              <lucide-icon [img]="Plus" size="18"></lucide-icon>
              Add another goal
            </button>

            <button type="submit" [disabled]="goalForm.invalid" class="btn btn-primary full-width">
              Start Day
            </button>
          </div>
        </form>
      </div>

      <!-- EVENING REFLECTION (Goals exist) -->
      <div *ngIf="hasGoals()" class="fade-in">
        <header class="header text-center">
          <h2>Daily Progress</h2>
          <p class="subtitle">Reflect on your journey.</p>
        </header>

        <div class="checklist card">
          <h3>Your Goals</h3>
          <div *ngFor="let goal of currentEntry()?.goals" 
               class="checklist-item" 
               (click)="toggleGoal(goal.id)"
               [class.completed]="goal.completed">
            <div class="checkbox">
              <lucide-icon *ngIf="goal.completed" [img]="Check" size="16" color="white"></lucide-icon>
            </div>
            <span class="goal-text">{{ goal.text }}</span>
          </div>
        </div>

        <div class="reflection-section">
          <h3>Evening Reflection</h3>
          
          <!-- Mood Selector -->
          <div class="mood-selector">
            <p class="label">How are you feeling?</p>
            <div class="moods">
              <button *ngFor="let m of moods" 
                      (click)="selectedMood = m.value"
                      [class.selected]="selectedMood === m.value"
                      class="mood-btn">
                {{ m.emoji }}
              </button>
            </div>
          </div>

          <textarea 
            [(ngModel)]="reflectionText" 
            placeholder="How did today go? What are you grateful for?"
            class="textarea-field"
            rows="5"></textarea>

          <!-- Image Upload -->
          <div class="image-upload-section">
            <div *ngIf="!selectedImage" class="upload-placeholder" (click)="fileInput.click()">
              <lucide-icon [img]="ImageIcon" size="24"></lucide-icon>
              <span>Add a photo</span>
              <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" hidden>
            </div>

            <div *ngIf="selectedImage" class="image-preview">
              <img [src]="selectedImage" alt="Daily photo">
              <button class="remove-img-btn" (click)="removeImage()">
                <lucide-icon [img]="X" size="16" color="white"></lucide-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="actions">
          <button (click)="saveReflection()" class="btn btn-primary full-width save-btn">
            Save & Finish
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .add-entry-page {
      padding-top: var(--spacing-lg);
      padding-bottom: 100px;
    }

    .save-btn {
      margin-top: var(--spacing-xl);
    }

    .header {
      margin-bottom: var(--spacing-xl);
    }

    .subtitle {
      color: var(--color-text-muted);
    }


    /* Form Styles */
    .goals-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .goal-input-group {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }

    .input-field, .textarea-field {
      width: 100%;
      padding: var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 1rem;
      background: var(--color-surface);
      transition: border-color 0.2s;
    }

    .input-field:focus, .textarea-field:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .input-field.error {
      border-color: var(--color-danger);
    }

    .btn-icon {
      padding: var(--spacing-sm);
      color: var(--color-text-muted);
    }
    
    .btn-icon.danger { color: var(--color-danger); }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: center;
    }

    .full-width { width: 100%; }

    /* Checklist Styles */
    .checklist {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .checklist h3, .reflection-section h3 {
      font-size: 1rem;
      color: var(--color-text-muted);
      margin-bottom: var(--spacing-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .checklist-item:active { opacity: 0.6; }

    .checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid var(--color-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background-color 0.2s;
    }

    .checklist-item.completed .checkbox {
      background-color: var(--color-primary);
    }

    .checklist-item.completed .goal-text {
      text-decoration: line-through;
      color: var(--color-text-muted);
    }

    .reflection-section {
      margin-top: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    /* Mood Selector */
    .mood-selector {
      margin-bottom: var(--spacing-sm);
    }
    
    .mood-selector .label {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin-bottom: var(--spacing-sm);
    }

    .moods {
      display: flex;
      justify-content: space-between;
      background: var(--color-surface);
      padding: var(--spacing-sm);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .mood-btn {
      font-size: 1.5rem;
      padding: var(--spacing-xs);
      border-radius: 50%;
      transition: transform 0.2s, background-color 0.2s;
    }

    .mood-btn:active { transform: scale(0.9); }
    .mood-btn.selected {
      background-color: var(--color-secondary);
      transform: scale(1.1);
    }

    /* Image Upload */
    .image-upload-section {
      margin-top: var(--spacing-sm);
    }

    .upload-placeholder {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .upload-placeholder:active { border-color: var(--color-primary); }

    .image-preview {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }

    .image-preview img {
      width: 100%;
      height: auto;
      display: block;
    }

    .remove-img-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.5);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AddEntryComponent {
  private fb = inject(FormBuilder);
  private goalService = inject(GoalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly Plus = Plus;
  readonly Check = Check;
  readonly Trash2 = Trash2;
  readonly ImageIcon = ImageIcon;
  readonly X = X;

  currentDate = signal(new Date().toISOString().split('T')[0]);
  currentEntry = computed(() => this.goalService.getEntry(this.currentDate()));
  
  hasGoals = signal(false);
  reflectionText = '';
  selectedMood: any = null;
  selectedImage: string | null = null;

  moods = [
    { emoji: '😄', value: 'happy' },
    { emoji: '⚡', value: 'energetic' },
    { emoji: '😐', value: 'neutral' },
    { emoji: '😴', value: 'tired' },
    { emoji: '😔', value: 'sad' }
  ];

  // Morning Form
  goalForm = this.fb.group({
    goals: this.fb.array([
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required)
    ])
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.currentDate.set(params['date']);
      }
    });

    effect(() => {
      const entry = this.currentEntry();
      if (entry && entry.goals.length > 0) {
        this.hasGoals.set(true);
        this.reflectionText = entry.reflection || '';
        this.selectedMood = entry.mood || null;
        this.selectedImage = entry.image || null;
      } else {
        this.hasGoals.set(false);
      }
    });
  }

  get goalsArray() {
    return this.goalForm.get('goals') as FormArray;
  }

  addGoalField() {
    this.goalsArray.push(this.fb.control('', Validators.required));
  }

  removeGoal(index: number) {
    this.goalsArray.removeAt(index);
  }

  isFieldInvalid(index: number): boolean {
    const control = this.goalsArray.at(index);
    return control.invalid && (control.dirty || control.touched);
  }

  saveGoals() {
    if (this.goalForm.valid) {
      const goals = this.goalForm.value.goals as string[];
      this.goalService.setGoals(this.currentDate(), goals);
      this.router.navigate(['/dashboard']);
    }
  }

  toggleGoal(id: string) {
    this.goalService.toggleGoal(id, this.currentDate());
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file).then(compressed => {
        this.selectedImage = compressed;
      });
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  }

  removeImage() {
    this.selectedImage = null;
  }

  saveReflection() {
    this.goalService.saveReflection(this.reflectionText, this.selectedMood, this.selectedImage || undefined, this.currentDate());
    
    // If editing past, go to memories. If today, go to dashboard.
    const today = new Date().toISOString().split('T')[0];
    if (this.currentDate() === today) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/memories']);
    }
  }
}
