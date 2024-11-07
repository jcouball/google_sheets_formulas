function testTaskAssignments() {
  var tasks = [["Task 1"], ["Task 2"], ["Task 3"]];
  var assigneesCsvs = [["Alice, Bob"], ["Charlie"], ["David, Eve"]];
  var expected = [
    ["Task 1", "Alice"],
    ["Task 1", "Bob"],
    ["Task 2", "Charlie"],
    ["Task 3", "David"],
    ["Task 3", "Eve"]
  ];
  var result = taskAssignments(tasks, assigneesCsvs);
  Logger.log(result);
}

function taskAssignments(tasks, assigneesCsvs, target_end_dates) {
  var taskAssignments = [];

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i][0].trim();
    var target_end_date = target_end_dates[i][0];

    Logger.log("task: " + task);

    var assigneesCsv = assigneesCsvs[i][0].trim();

    if (task === "" || assigneesCsv === "") continue;

    // Split the assignee list by comma and trim each assignee
    var assignees = Utilities.parseCsv(assigneesCsv)[0].map(function(assignee) { return assignee.trim(); });

    // Logger.log("task: " + task + ", assignees: " + assignees);

    // Add a row for each unique task and assignee
    for (var j = 0; j < assignees.length; j++) {
      taskAssignments.push([assignees[j], task, target_end_date]);
    }
  }
  var sortedTaskAssignments = taskAssignments.sort(function(a, b) { return a[0].localeCompare(b[0]); });
  // Logger.log(sortedTaskAssignments);
  return sortedTaskAssignments;
}
