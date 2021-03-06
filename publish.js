/*
 * @Desrcription: 构建发布npm
 * @Author: dongyue
 * @CreateDate: 
 * @LastEditors: dongyue
 * @LastEditTime: 2020-08-06 14:55:03
 */
const { execSync, spawn } = require('child_process');

module.exports = function (needPush) {
    try {
        execSync('which git'); // 在同步进程执行命令，在子进程关闭之前不会返回
    } catch (error) {
        // 报错说明没装git，直接退出进程
        console.log('error: 没装git');
        process.exit(1); // 退出进程，参数0代表成功，1代表失败，是进程退出码
    }

    execSync('git add .'); // 执行git add .

    /** argv用于取启动本次命令时，加的参数，是个数组，第一个值为process.execPath， 第二个元素为执行的文件路径，后面的参数是正常参数 */
    const option = process.argv[2] || 'feat';
    const msg = `${option}: ${process.argv[3] || 'update'}`; // 取message

    const gm = spawn('git', ['commit', '-m', msg]); // spawn创建子进程进行操作，与exec不同的是，会返回stdout或stderr流，且大小没有限制，exec限制200k

    // gm是spawn返回的子进程，out和err的管道和主进程一样即可
    gm.stderr.pipe(process.stderr);
    gm.stdout.pipe(process.stdout);

    // 子进程退出事件，code是子进程退出码，为0时是正确退出。
    gm.on('close', code => {
        if (code === 0 && needPush) {
            const gp = spawn('git', ['push']); // 加个push
            gp.stderr.pipe(process.stderr);
            gp.stdout.pipe(process.stdout);

            gp.on('close', code => {
                if (code === 0) {
                    const nb = spawn('npm', ['build']);
                    nb.stderr.pipe(process.stderr);
                    nb.stdout.pipe(process.stdout);
                    nb.on('close', code => {
                        const vp = spawn('npm', ['version', 'patch']);
                        vp.stderr.pipe(process.stderr);
                        vp.stdout.pipe(process.stdout);
                        const pb = spawn('npm', ['publish']);
                        pb.stderr.pipe(process.stderr);
                        pb.stdout.pipe(process.stdout);
                    })
                }
            })
        }
    })
}