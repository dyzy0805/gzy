/*
 * @Desrcription: 创建分支并推到线上
 * @Author: dongyue
 * @CreateDate: 
 * @LastEditors: dongyue
 * @LastEditTime: 2020-07-16 11:53:48
 */ 

const { execSync, spawn } = require('child_process');

module.exports = function () {
    try {
        execSync('which git'); // 在同步进程执行命令，在子进程关闭之前不会返回
    } catch (error) {
        // 报错说明没装git，直接退出进程
        console.log('error: 没装git');
        process.exit(1); // 退出进程，参数0代表成功，1代表失败，是进程退出码
    }
    // git co -b ${name}
    /** argv用于取启动本次命令时，加的参数，是个数组，第一个值为process.execPath， 第二个元素为执行的文件路径，后面的参数是正常参数 */
    const branchName = process.argv[2];
    if (!branchName) {
        console.log('error: 请填写要创建的分支名');
        process.exit(1);
    }
    
    // 删除本地分支
    const gbc = spawn('git', ['checkout', '-b', branchName]); // spawn创建子进程进行操作，与exec不同的是，会返回stdout或stderr流，且大小没有限制，exec限制200k

    // gbc是spawn返回的子进程，out和err的管道和主进程一样即可
    gbc.stderr.pipe(process.stderr);
    gbc.stdout.pipe(process.stdout);

    // 子进程退出事件，code是子进程退出码，为0时是正确退出。
    gbc.on('close', code => {
        // 子进程成功后操作
        if (code === 0) {
            // git push origin --delete ${name}
            const gpd = spawn('git', ['push', '--set-upstream', 'origin', branchName]); // 删除远程分支
            gpd.stderr.pipe(process.stderr);
            gpd.stdout.pipe(process.stdout);
        }
    })
}