#include <stdio.h>

struct Process {
    int pid, at, bt, wt, tat, priority, completed;
};

// -------- SORT BY ARRIVAL --------
void sortByArrival(struct Process p[], int n) {
    int i, j;
    struct Process temp;

    for(i = 0; i < n-1; i++) {
        for(j = i+1; j < n; j++) {
            if(p[i].at > p[j].at) {
                temp = p[i];
                p[i] = p[j];
                p[j] = temp;
            }
        }
    }
}

// -------- FCFS --------
float fcfs(struct Process p[], int n) {
    int i, time = 0;
    float avg = 0;

    sortByArrival(p, n);

    for(i = 0; i < n; i++) {
        if(time < p[i].at)
            time = p[i].at;

        p[i].wt = time - p[i].at;
        time += p[i].bt;
        p[i].tat = p[i].wt + p[i].bt;

        avg += p[i].wt;
    }

    return avg / n;
}

// -------- SJF --------
float sjf(struct Process p[], int n) {
    int i, completed = 0, time = 0;
    float avg = 0;

    for(i = 0; i < n; i++)
        p[i].completed = 0;

    while(completed < n) {
        int idx = -1, min_bt = 9999;

        for(i = 0; i < n; i++) {
            if(p[i].at <= time && p[i].completed == 0) {
                if(p[i].bt < min_bt) {
                    min_bt = p[i].bt;
                    idx = i;
                }
            }
        }

        if(idx != -1) {
            p[idx].wt = time - p[idx].at;
            time += p[idx].bt;
            p[idx].tat = p[idx].wt + p[idx].bt;
            p[idx].completed = 1;

            avg += p[idx].wt;
            completed++;
        } else time++;
    }

    return avg / n;
}

// -------- PRIORITY --------
float priorityScheduling(struct Process p[], int n) {
    int i, completed = 0, time = 0;
    float avg = 0;

    for(i = 0; i < n; i++)
        p[i].completed = 0;

    while(completed < n) {
        int idx = -1, min_pr = 9999;

        for(i = 0; i < n; i++) {
            if(p[i].at <= time && p[i].completed == 0) {
                if(p[i].priority < min_pr) {
                    min_pr = p[i].priority;
                    idx = i;
                }
            }
        }

        if(idx != -1) {
            p[idx].wt = time - p[idx].at;
            time += p[idx].bt;
            p[idx].tat = p[idx].wt + p[idx].bt;
            p[idx].completed = 1;

            avg += p[idx].wt;
            completed++;
        } else time++;
    }

    return avg / n;
}

// -------- ROUND ROBIN --------
float roundRobin(struct Process p[], int n, int quantum) {
    int rem_bt[n], wt[n];
    int i, time = 0, completed = 0;
    float avg = 0;

    for(i = 0; i < n; i++) {
        rem_bt[i] = p[i].bt;
        wt[i] = 0;
    }

    while(completed < n) {
        int progress = 0;

        for(i = 0; i < n; i++) {
            if(rem_bt[i] > 0 && p[i].at <= time) {
                progress = 1;

                if(rem_bt[i] > quantum) {
                    time += quantum;
                    rem_bt[i] -= quantum;
                } else {
                    time += rem_bt[i];
                    wt[i] = time - p[i].bt - p[i].at;
                    p[i].wt = wt[i];
                    p[i].tat = wt[i] + p[i].bt;
                    rem_bt[i] = 0;
                    completed++;
                }
            }
        }

        if(!progress) time++;
    }

    for(i = 0; i < n; i++)
        avg += wt[i];

    return avg / n;
}

// -------- DISPLAY --------
void displayWithGantt(struct Process p[], int n, char algo[],
                     int order1[], int time1[], int len1,
                     int order2[], int time2[], int len2, int showSecond) {

    int i;

    printf("\n============================\n");
    printf("BEST ALGORITHM: %s\n\n", algo);

    printf("PID\tAT\tBT\tPR\tWT\tTAT\n");
    for(i = 0; i < n; i++) {
        printf("P%d\t%d\t%d\t%d\t%d\t%d\n",
            p[i].pid, p[i].at, p[i].bt,
            p[i].priority, p[i].wt, p[i].tat);
    }

    // First Gantt
    printf("\nGantt Chart:\n|");
    for(i = 0; i < len1; i++) {
        printf(" P%d |", order1[i]);
    }

    printf("\n%d", time1[0]);
    for(i = 1; i <= len1; i++) {
        printf("   %d", time1[i]);
    }

    // Second Gantt (RR only)
    if(showSecond) {
        printf("\n\nGantt Chart (Detailed RR):\n|");
        for(i = 0; i < len2; i++) {
            printf(" P%d |", order2[i]);
        }

        printf("\n%d", time2[0]);
        for(i = 1; i <= len2; i++) {
            printf("   %d", time2[i]);
        }
    }
}

// -------- MAIN --------
int main() {
    int n, i, quantum;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    struct Process p[n], temp[n];

    for(i = 0; i < n; i++) {
        p[i].pid = i+1;

        printf("Arrival Time for P%d: ", i+1);
        scanf("%d", &p[i].at);

        printf("Burst Time for P%d: ", i+1);
        scanf("%d", &p[i].bt);

        printf("Priority for P%d: ", i+1);
        scanf("%d", &p[i].priority);
    }

    printf("Enter Time Quantum: ");
    scanf("%d", &quantum);

    // Backup
    for(i = 0; i < n; i++) temp[i] = p[i];

    float f = fcfs(p, n);

    for(i = 0; i < n; i++) p[i] = temp[i];
    float s = sjf(p, n);

    for(i = 0; i < n; i++) p[i] = temp[i];
    float pr = priorityScheduling(p, n);

    for(i = 0; i < n; i++) p[i] = temp[i];
    float rr = roundRobin(p, n, quantum);

    float min = f;
    int choice = 1;

    if(s < min) { min = s; choice = 2; }
    if(pr < min) { min = pr; choice = 3; }
    if(rr < min) { min = rr; choice = 4; }

    int order1[100], time1[100];
    int order2[100], time2[100];
    int len1 = 0, len2 = 0;

    // Restore
    for(i = 0; i < n; i++) p[i] = temp[i];

    // -------- FCFS --------
    if(choice == 1) {
        int time = 0;
        sortByArrival(p, n);
        time1[0] = p[0].at;

        for(i = 0; i < n; i++) {
            if(time < p[i].at)
                time = p[i].at;

            p[i].wt = time - p[i].at;
            time += p[i].bt;
            p[i].tat = p[i].wt + p[i].bt;

            order1[i] = p[i].pid;
            time1[i+1] = time;
        }
        len1 = n;

        displayWithGantt(p, n, "FCFS", order1, time1, len1, NULL, NULL, 0, 0);
    }

    // -------- ROUND ROBIN --------
    else if(choice == 4) {
        int rem_bt[n], time = 0, completed = 0, k = 0;
        time2[0] = 0;

        for(i = 0; i < n; i++) {
            rem_bt[i] = p[i].bt;
            order1[i] = p[i].pid;
            time1[i+1] = time1[i] + p[i].bt;
        }
        len1 = n;

        while(completed < n) {
            for(i = 0; i < n; i++) {
                if(rem_bt[i] > 0 && p[i].at <= time) {

                    order2[k] = p[i].pid;

                    if(rem_bt[i] > quantum) {
                        time += quantum;
                        rem_bt[i] -= quantum;
                    } else {
                        time += rem_bt[i];
                        p[i].wt = time - p[i].bt - p[i].at;
                        p[i].tat = p[i].wt + p[i].bt;
                        rem_bt[i] = 0;
                        completed++;
                    }

                    time2[k+1] = time;
                    k++;
                }
            }
            time++;
        }

        len2 = k;

        displayWithGantt(p, n, "Round Robin",
            order1, time1, len1,
            order2, time2, len2, 1);
    }

    printf("\nMinimum Average Waiting Time: %.2f\n", min);

    return 0;
}
