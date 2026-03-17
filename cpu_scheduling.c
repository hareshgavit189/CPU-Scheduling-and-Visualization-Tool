#include <stdio.h>

struct Process {
    int pid, bt, wt, tat;
};

// Function to calculate FCFS
void fcfs(struct Process p[], int n) {
    int i;
    p[0].wt = 0;

    for(i = 1; i < n; i++) {
        p[i].wt = p[i-1].wt + p[i-1].bt;
    }

    printf("\n--- FCFS Scheduling ---\n");

    for(i = 0; i < n; i++) {
        p[i].tat = p[i].wt + p[i].bt;
        printf("P%d -> WT: %d, TAT: %d\n", p[i].pid, p[i].wt, p[i].tat);
    }

    // Gantt Chart
    printf("\nGantt Chart:\n|");
    for(i = 0; i < n; i++) {
        printf(" P%d |", p[i].pid);
    }
    printf("\n");
}

// Function for SJF (Non-Preemptive)
void sjf(struct Process p[], int n) {
    int i, j;
    struct Process temp;

    // Sort by burst time
    for(i = 0; i < n-1; i++) {
        for(j = i+1; j < n; j++) {
            if(p[i].bt > p[j].bt) {
                temp = p[i];
                p[i] = p[j];
                p[j] = temp;
            }
        }
    }

    p[0].wt = 0;

    for(i = 1; i < n; i++) {
        p[i].wt = p[i-1].wt + p[i-1].bt;
    }

    printf("\n--- SJF Scheduling ---\n");

    for(i = 0; i < n; i++) {
        p[i].tat = p[i].wt + p[i].bt;
        printf("P%d -> WT: %d, TAT: %d\n", p[i].pid, p[i].wt, p[i].tat);
    }

    printf("\nGantt Chart:\n|");
    for(i = 0; i < n; i++) {
        printf(" P%d |", p[i].pid);
    }
    printf("\n");
}

// Round Robin
void roundRobin(int bt[], int n, int quantum) {
    int rem_bt[n], t = 0, i;
    int wt[n] = {0}, tat[n];

    for(i = 0; i < n; i++)
        rem_bt[i] = bt[i];

    while(1) {
        int done = 1;

        for(i = 0; i < n; i++) {
            if(rem_bt[i] > 0) {
                done = 0;

                if(rem_bt[i] > quantum) {
                    t += quantum;
                    rem_bt[i] -= quantum;
                } else {
                    t += rem_bt[i];
                    wt[i] = t - bt[i];
                    rem_bt[i] = 0;
                }
            }
        }

        if(done == 1)
            break;
    }

    printf("\n--- Round Robin Scheduling ---\n");

    for(i = 0; i < n; i++) {
        tat[i] = bt[i] + wt[i];
        printf("P%d -> WT: %d, TAT: %d\n", i+1, wt[i], tat[i]);
    }
}

int main() {
    int n, i, quantum;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    struct Process p[n];
    int bt[n];

    for(i = 0; i < n; i++) {
        p[i].pid = i+1;
        printf("Enter Burst Time for P%d: ", i+1);
        scanf("%d", &p[i].bt);
        bt[i] = p[i].bt;
    }

    fcfs(p, n);
    sjf(p, n);

    printf("\nEnter Time Quantum for Round Robin: ");
    scanf("%d", &quantum);

    roundRobin(bt, n, quantum);

    return 0;
}
